export declare class CreateEventDto {
    title: string;
    startTime: string;
    endTime: string;
    customerId: string;
    status?: string;
    type?: string;
    externalSync?: boolean;
}
export declare class UpdateEventDto extends CreateEventDto {
}
