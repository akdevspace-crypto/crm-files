import { TimelineService } from './timeline.service';
export declare class TimelineController {
    private readonly timelineService;
    constructor(timelineService: TimelineService);
    getTimeline(id: string, type?: 'lead' | 'customer'): Promise<{
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
