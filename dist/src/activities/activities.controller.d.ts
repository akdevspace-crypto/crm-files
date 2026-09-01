import { ActivitiesService } from './activities.service';
import { CreateActivityDto, CreateCommentDto } from './dto/activity.dto';
export declare class ActivitiesController {
    private readonly activitiesService;
    constructor(activitiesService: ActivitiesService);
    getActivities(customerId?: string, leadId?: string): Promise<({
        customer: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string;
            emergencyContact: string | null;
            platform: string | null;
            platformUserId: string | null;
            instagramUsername: string | null;
            instagramProfilePic: string | null;
            profileEnriched: boolean;
            enrichmentFailed: boolean;
            lastProfileSync: Date | null;
        } | null;
        lead: {
            id: string;
            city: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            status: import(".prisma/client").$Enums.LeadStatus;
            source: string | null;
            sentiment: string | null;
            notes: string | null;
            phoneNumber: string;
            customerName: string;
            serviceInterest: string | null;
            priority: import(".prisma/client").$Enums.LeadPriority;
            conversionScore: number | null;
            uploadedById: string | null;
            assignedAgentId: string | null;
            uploadHistoryId: string | null;
            lockedAt: Date | null;
        } | null;
        attachments: {
            id: string;
            createdAt: Date;
            leadId: string | null;
            activityId: string | null;
            filename: string;
            fileUrl: string;
            size: number | null;
            mimeType: string | null;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
            activityId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        description: string | null;
        status: string;
        type: string;
        customerId: string | null;
        leadId: string | null;
        agentId: string;
        dueDate: Date | null;
        subject: string;
        completedAt: Date | null;
    })[]>;
    createActivity(req: any, dto: CreateActivityDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        status: string;
        type: string;
        customerId: string | null;
        leadId: string | null;
        agentId: string;
        dueDate: Date | null;
        subject: string;
        completedAt: Date | null;
    }>;
    addComment(req: any, id: string, dto: CreateCommentDto): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        authorId: string;
        activityId: string;
    }>;
    deleteActivity(id: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        status: string;
        type: string;
        customerId: string | null;
        leadId: string | null;
        agentId: string;
        dueDate: Date | null;
        subject: string;
        completedAt: Date | null;
    }>;
}
