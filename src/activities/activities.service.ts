import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivitiesRepository } from './activities.repository';
import { CreateActivityDto, CreateCommentDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activitiesRepo: ActivitiesRepository) {}

  async getActivities(customerId?: string, leadId?: string) {
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (leadId) where.leadId = leadId;

    return this.activitiesRepo.findMany(where);
  }

  async getActivityById(id: string) {
    const activity = await this.activitiesRepo.findById(id);
    if (!activity) {
      throw new NotFoundException('Activity log not found');
    }
    return activity;
  }

  async createActivity(dto: CreateActivityDto, agentId: string) {
    // Check if agent exists or link profile
    return this.activitiesRepo.create({
      type: dto.type,
      subject: dto.subject,
      description: dto.description,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: dto.status || 'PENDING',
      customerId: dto.customerId || undefined,
      leadId: dto.leadId || undefined,
      agentId,
    });
  }

  async addActivityComment(activityId: string, authorId: string, dto: CreateCommentDto) {
    await this.getActivityById(activityId);
    return this.activitiesRepo.addComment(activityId, authorId, dto.content);
  }

  async deleteActivity(id: string) {
    await this.getActivityById(id);
    return this.activitiesRepo.delete(id);
  }
}
