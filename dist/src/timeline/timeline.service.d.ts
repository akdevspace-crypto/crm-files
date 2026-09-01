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
export declare class TimelineService {
    private readonly prisma;
    private readonly liveGateway;
    private readonly logger;
    constructor(prisma: PrismaService, liveGateway: LiveGateway);
    logEvent(data: CreateTimelineEventDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        department: string | null;
        status: string;
        userId: string | null;
        eventType: string;
        title: string;
        communication: string | null;
        source: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        customerId: string | null;
        leadId: string | null;
    } | undefined>;
    getTimeline(entityId: string, type: 'lead' | 'customer'): Promise<{
        user: {
            id: string;
            name: string;
        } | null;
        id: string;
        createdAt: Date;
        description: string | null;
        department: string | null;
        status: string;
        userId: string | null;
        eventType: string;
        title: string;
        communication: string | null;
        source: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        customerId: string | null;
        leadId: string | null;
    }[]>;
}
