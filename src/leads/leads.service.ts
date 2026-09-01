import { Injectable, Inject, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { LeadsRepository } from './leads.repository';
import { CreateLeadDto, UpdateLeadDto, LeadStatusUpdateDto } from './dto/lead.dto';
import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { TimelineService } from '../timeline/timeline.service';
import { LiveGateway } from '../websockets/live.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepo: LeadsRepository,
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectQueue('lead_automation') private readonly leadAutomationQueue: Queue,
    private readonly timelineService: TimelineService,
    private readonly liveGateway: LiveGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getLeads(status?: string, agentId?: string, userRole?: string, reqAgentId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (agentId) where.assignedAgentId = agentId;

    const leads = await this.leadsRepo.findMany(where);

    // Apply lead data masking based on user role (protect patient PII data)
    return leads.map((lead) => {
      let phone = lead.phoneNumber;
      const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

      if (!isAdmin && lead.assignedAgentId !== reqAgentId) {
        phone = phone.length > 4 ? 'X'.repeat(phone.length - 4) + phone.slice(-4) : 'XXXX';
      }

      return {
        ...lead,
        phoneNumber: phone,
        agentName: lead.assignedAgent?.name || 'Unassigned',
      };
    });
  }

  async createLead(dto: CreateLeadDto, uploadedById?: string) {
    // Real-Time Duplicate Prevention
    if (dto.phoneNumber) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { phone: dto.phoneNumber },
      });
      if (existingCustomer) {
        throw new ConflictException(`A customer with phone number ${dto.phoneNumber} already exists.`);
      }

      const existingLead = await this.prisma.lead.findUnique({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (existingLead) {
        throw new ConflictException(`A lead with phone number ${dto.phoneNumber} already exists.`);
      }
    }

    const lead = await this.leadsRepo.create({
      customerName: dto.customerName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      serviceInterest: dto.serviceInterest,
      city: dto.city,
      notes: dto.notes,
      source: dto.source || 'Manual Entry',
      uploadedById,
    });

    // Enqueue a job to check if the lead is unattended after 5 minutes (300,000 ms)
    await this.leadAutomationQueue.add('check_lead_timeout', { leadId: lead.id }, {
      delay: 300000,
    });

    await this.timelineService.logEvent({
      leadId: lead.id,
      eventType: 'ENQUIRY_CREATED',
      title: 'Enquiry Created',
      description: `New enquiry via ${dto.source || 'Website'}`,
      department: 'Sales',
      communication: dto.source || 'Website',
      status: 'COMPLETED',
    });

    if (dto.notes && dto.notes.trim() !== '') {
      try {
        await this.appendLeadNote(lead.id, uploadedById || '', { content: dto.notes });
      } catch (e) {
        console.error('Failed to append initial lead note', e);
      }
    }

    // Emit event for Automation Engine (e.g., Automated Outbound Calling)
    this.eventEmitter.emit('lead.created', lead);

    return lead;
  }

  async claimLead(leadId: string, agentId: string) {
    const lockKey = `lead_lock:${leadId}`;
    
    // Acquire Redis Lock (10s expiry) to prevent claim collisions
    const acquired = await this.redis.set(lockKey, agentId, 'EX', 10, 'NX');
    if (!acquired) {
      throw new ConflictException('Lead is currently being claimed by another agent');
    }

    try {
      const agent = await this.leadsRepo.findAgentByUserId(agentId);
      const realAgentId = agent ? agent.id : agentId;
      console.log(`[ClaimLead] Input AgentID(UserId): ${agentId}, Found Agent: ${agent?.id}, Fallback: ${realAgentId}`);

      const lead = await this.leadsRepo.findById(leadId);
      if (!lead) {
        throw new NotFoundException('Lead not found');
      }

      if (lead.assignedAgentId) {
        throw new BadRequestException('Lead has already been claimed');
      }

      // Assign agent and transition status
      const updated = await this.leadsRepo.update(leadId, {
        assignedAgentId: realAgentId,
        status: 'IN_PROGRESS',
        lockedAt: new Date(),
      });

      // Log status transition audited database trail
      await this.leadsRepo.logConversion(leadId, realAgentId, lead.status, 'IN_PROGRESS', 'Lead claimed by agent');

      await this.timelineService.logEvent({
        leadId: lead.id,
        userId: realAgentId,
        eventType: 'ASSIGNED',
        title: 'Assigned to Agent',
        department: 'Sales',
        status: 'COMPLETED',
      });

      return updated;
    } finally {
      // Release lock
      await this.redis.del(lockKey);
    }
  }

  async updateLeadStatus(leadId: string, agentId: string, dto: LeadStatusUpdateDto) {
    const agent = await this.leadsRepo.findAgentByUserId(agentId);
    const realAgentId = agent ? agent.id : agentId;

    const lead = await this.leadsRepo.findById(leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const updated = await this.leadsRepo.update(leadId, {
      status: dto.status,
    });

    await this.leadsRepo.logConversion(leadId, realAgentId, lead.status, dto.status, dto.notes);

    if (dto.notes && dto.notes.trim() !== '') {
      try {
        await this.appendLeadNote(leadId, agentId, {
          content: `Status Update: ${dto.notes}`,
        });
      } catch (e) {
        console.error('Failed to append status update note', e);
      }
    }

    return updated;
  }

  async getLeadNotes(leadId: string) {
    return this.leadsRepo.getNotes(leadId);
  }

  async appendLeadNote(leadId: string, userId: string, dto: any) {
    const agent = await this.leadsRepo.findAgentByUserId(userId);
    const realAgentId = agent ? agent.id : userId;

    const note = await this.leadsRepo.appendNote({
      content: dto.content,
      leadId,
      agentId: realAgentId,
      department: agent?.department || null,
      callId: dto.callId || null
    });

    // Log this as a timeline event
    await this.timelineService.logEvent({
      leadId,
      userId: realAgentId,
      eventType: 'NOTE_ADDED',
      title: 'Audit Note Appended',
      department: agent?.department || 'System',
      status: 'COMPLETED'
    });

    return note;
  }

  async appendCorrectionNote(leadId: string, userId: string, originalNoteId: string, correctionContent: string) {
    const agent = await this.leadsRepo.findAgentByUserId(userId);
    const realAgentId = agent ? agent.id : userId;

    const note = await this.leadsRepo.appendNote({
      content: correctionContent,
      leadId,
      agentId: realAgentId,
      department: agent?.department || null,
      isCorrection: true,
      correctedNoteId: originalNoteId,
      actionType: 'Correction',
      source: 'Manual'
    });

    await this.timelineService.logEvent({
      leadId,
      userId: realAgentId,
      eventType: 'NOTE_CORRECTION',
      title: 'Note Correction Appended',
      department: agent?.department || 'System',
      status: 'COMPLETED'
    });

    return note;
  }
}
