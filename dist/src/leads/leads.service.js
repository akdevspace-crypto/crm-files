"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const leads_repository_1 = require("./leads.repository");
const ioredis_1 = require("ioredis");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const timeline_service_1 = require("../timeline/timeline.service");
const live_gateway_1 = require("../websockets/live.gateway");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let LeadsService = class LeadsService {
    leadsRepo;
    prisma;
    redis;
    leadAutomationQueue;
    timelineService;
    liveGateway;
    eventEmitter;
    constructor(leadsRepo, prisma, redis, leadAutomationQueue, timelineService, liveGateway, eventEmitter) {
        this.leadsRepo = leadsRepo;
        this.prisma = prisma;
        this.redis = redis;
        this.leadAutomationQueue = leadAutomationQueue;
        this.timelineService = timelineService;
        this.liveGateway = liveGateway;
        this.eventEmitter = eventEmitter;
    }
    async getLeads(status, agentId, userRole, reqAgentId) {
        const where = {};
        if (status)
            where.status = status;
        if (agentId)
            where.assignedAgentId = agentId;
        const leads = await this.leadsRepo.findMany(where);
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
    async createLead(dto, uploadedById) {
        if (dto.phoneNumber) {
            const existingCustomer = await this.prisma.customer.findUnique({
                where: { phone: dto.phoneNumber },
            });
            if (existingCustomer) {
                throw new common_1.ConflictException(`A customer with phone number ${dto.phoneNumber} already exists.`);
            }
            const existingLead = await this.prisma.lead.findUnique({
                where: { phoneNumber: dto.phoneNumber },
            });
            if (existingLead) {
                throw new common_1.ConflictException(`A lead with phone number ${dto.phoneNumber} already exists.`);
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
            }
            catch (e) {
                console.error('Failed to append initial lead note', e);
            }
        }
        this.eventEmitter.emit('lead.created', lead);
        return lead;
    }
    async claimLead(leadId, agentId) {
        const lockKey = `lead_lock:${leadId}`;
        const acquired = await this.redis.set(lockKey, agentId, 'EX', 10, 'NX');
        if (!acquired) {
            throw new common_1.ConflictException('Lead is currently being claimed by another agent');
        }
        try {
            const agent = await this.leadsRepo.findAgentByUserId(agentId);
            const realAgentId = agent ? agent.id : agentId;
            console.log(`[ClaimLead] Input AgentID(UserId): ${agentId}, Found Agent: ${agent?.id}, Fallback: ${realAgentId}`);
            const lead = await this.leadsRepo.findById(leadId);
            if (!lead) {
                throw new common_1.NotFoundException('Lead not found');
            }
            if (lead.assignedAgentId) {
                throw new common_1.BadRequestException('Lead has already been claimed');
            }
            const updated = await this.leadsRepo.update(leadId, {
                assignedAgentId: realAgentId,
                status: 'IN_PROGRESS',
                lockedAt: new Date(),
            });
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
        }
        finally {
            await this.redis.del(lockKey);
        }
    }
    async updateLeadStatus(leadId, agentId, dto) {
        const agent = await this.leadsRepo.findAgentByUserId(agentId);
        const realAgentId = agent ? agent.id : agentId;
        const lead = await this.leadsRepo.findById(leadId);
        if (!lead) {
            throw new common_1.NotFoundException('Lead not found');
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
            }
            catch (e) {
                console.error('Failed to append status update note', e);
            }
        }
        return updated;
    }
    async getLeadNotes(leadId) {
        return this.leadsRepo.getNotes(leadId);
    }
    async appendLeadNote(leadId, userId, dto) {
        const agent = await this.leadsRepo.findAgentByUserId(userId);
        const realAgentId = agent ? agent.id : userId;
        const note = await this.leadsRepo.appendNote({
            content: dto.content,
            leadId,
            agentId: realAgentId,
            department: agent?.department || null,
            callId: dto.callId || null
        });
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
    async appendCorrectionNote(leadId, userId, originalNoteId, correctionContent) {
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
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('REDIS_CLIENT')),
    __param(3, (0, bullmq_2.InjectQueue)('lead_automation')),
    __metadata("design:paramtypes", [leads_repository_1.LeadsRepository,
        prisma_service_1.PrismaService,
        ioredis_1.Redis,
        bullmq_1.Queue,
        timeline_service_1.TimelineService,
        live_gateway_1.LiveGateway,
        event_emitter_1.EventEmitter2])
], LeadsService);
//# sourceMappingURL=leads.service.js.map