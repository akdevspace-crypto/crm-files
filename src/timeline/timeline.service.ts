import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveGateway } from '../websockets/live.gateway';

export interface CreateTimelineEventDto {
  customerId?: string;
  leadId?: string;
  eventType: string;
  title: string;
  description?: string;
  userId?: string;
  department?: string;
  communication?: string;
  status: string;
  metadata?: any;
}

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly liveGateway: LiveGateway,
  ) {}

  async logEvent(data: CreateTimelineEventDto) {
    try {
      this.logger.log(`Logging timeline event: ${data.title}`);
      const event = await this.prisma.clientTimelineEvent.create({
        data,
      });
      if (data.leadId) {
        this.liveGateway.broadcastLeadEvent(data.leadId, 'lead-action-completed', { eventId: event.id });
      }
      return event;
    } catch (error) {
      this.logger.error(`Failed to log timeline event: ${error.message}`);
    }
  }

  async getTimeline(entityId: string, type: 'lead' | 'customer') {
    const events = await this.prisma.clientTimelineEvent.findMany({
      where: type === 'lead' ? { leadId: entityId } : { customerId: entityId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, agentProfile: { select: { name: true } } } } },
    });
    
    return events.map(event => ({
      ...event,
      user: event.user ? {
        id: event.user.id,
        name: event.user.agentProfile?.name || event.user.email
      } : null
    }));
  }
}
