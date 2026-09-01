export declare enum ActivityType {
    CALL = "CALL",
    MEETING = "MEETING",
    EMAIL = "EMAIL",
    TASK = "TASK",
    WHATSAPP = "WHATSAPP",
    SITE_VISIT = "SITE_VISIT"
}
export declare class CreateActivityDto {
    type: ActivityType;
    subject: string;
    description?: string;
    dueDate?: string;
    status?: string;
    customerId?: string;
    leadId?: string;
}
export declare class CreateCommentDto {
    content: string;
}
