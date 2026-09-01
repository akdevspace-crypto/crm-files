import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(where: any) {
    return this.prisma.activity.findMany({
      where,
      include: {
        comments: true,
        attachments: true,
        customer: true,
        lead: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.activity.findUnique({
      where: { id },
      include: {
        comments: true,
        attachments: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.activity.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.activity.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.activity.delete({
      where: { id },
    });
  }

  async addComment(activityId: string, authorId: string, content: string) {
    return this.prisma.comment.create({
      data: {
        activityId,
        authorId,
        content,
      },
    });
  }
}
