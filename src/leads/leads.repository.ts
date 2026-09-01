import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(where: any) {
    return this.prisma.lead.findMany({
      where,
      include: {
        assignedAgent: true,
        followups: { orderBy: { followupDate: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignedAgent: true,
        followups: true,
        activities: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.lead.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async logConversion(leadId: string, agentId: string, oldStatus: any, newStatus: any, notes?: string) {
    return this.prisma.leadConversionLog.create({
      data: {
        leadId,
        agentId,
        oldStatus,
        newStatus,
        notes,
      },
    });
  }

  async findAgentByUserId(userId: string) {
    return this.prisma.agent.findFirst({
      where: { userId },
    });
  }

  async getNotes(leadId: string) {
    return this.prisma.leadNote.findMany({
      where: { leadId },
      include: {
        agent: {
          select: { name: true, department: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async appendNote(data: any) {
    return this.prisma.leadNote.create({
      data
    });
  }
}
