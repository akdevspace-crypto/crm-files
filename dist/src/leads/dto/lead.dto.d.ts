export declare class CreateLeadDto {
    customerName: string;
    phoneNumber: string;
    email?: string;
    serviceInterest?: string;
    city?: string;
    notes?: string;
    source?: string;
}
export declare class UpdateLeadDto extends CreateLeadDto {
    status?: string;
    priority?: string;
}
export declare class LeadStatusUpdateDto {
    status: string;
    notes?: string;
}
export declare class CreateLeadNoteDto {
    content: string;
    callId?: string;
}
