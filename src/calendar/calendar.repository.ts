import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateCalendar(agentId: string) {
    let calendar = await this.prisma.calendar.findUnique({
      where: { agentId },
    });

    if (!calendar) {
      calendar = await this.prisma.calendar.create({
        data: {
          agentId,
        },
      });
    }
    return calendar;
  }

  async findMany(calendarId: string) {
    return this.prisma.appointment.findMany({
      where: { calendarId },
      include: {
        customer: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        customer: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findByUserId(userId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { userId },
    });
    if (!agent) return [];

    const calendar = await this.findOrCreateCalendar(agent.id);
    return this.findMany(calendar.id);
  }

  async findById(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
    });
  }

  async create(calendarId: string, customerId: string, data: any) {
    return this.prisma.appointment.create({
      data: {
        calendarId,
        customerId,
        title: data.title,
        type: data.type || 'MEETING',
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status || 'SCHEDULED',
      },
    });
  }

  async createWithUserId(userId: string, customerId: string, data: any) {
    const agent = await this.prisma.agent.findUnique({
      where: { userId },
    });
    if (!agent) {
      throw new Error('Agent profile not found for this user');
    }
    const calendar = await this.findOrCreateCalendar(agent.id);
    return this.create(calendar.id, customerId, data);
  }

  async update(id: string, data: any) {
    return this.prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
