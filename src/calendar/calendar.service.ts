import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarRepository } from './calendar.repository';
import { CreateEventDto, UpdateEventDto } from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly calendarRepo: CalendarRepository) {}

  async getAgentEvents(userId: string, role?: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SUPERVISOR') {
      return this.calendarRepo.findAll();
    }
    return this.calendarRepo.findByUserId(userId);
  }

  async createEvent(userId: string, dto: CreateEventDto) {
    return this.calendarRepo.createWithUserId(userId, dto.customerId, {
      title: dto.title,
      type: dto.type,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      status: dto.status,
    });
  }

  async updateEvent(eventId: string, dto: UpdateEventDto) {
    const event = await this.calendarRepo.findById(eventId);
    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    return this.calendarRepo.update(eventId, {
      title: dto.title,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      status: dto.status,
    });
  }

  async deleteEvent(eventId: string) {
    const event = await this.calendarRepo.findById(eventId);
    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }
    return this.calendarRepo.delete(eventId);
  }
}
