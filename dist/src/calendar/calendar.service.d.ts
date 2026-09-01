import { CalendarRepository } from './calendar.repository';
import { CreateEventDto, UpdateEventDto } from './dto/calendar.dto';
export declare class CalendarService {
    private readonly calendarRepo;
    constructor(calendarRepo: CalendarRepository);
    getAgentEvents(userId: string, role?: string): Promise<({
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
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        type: import(".prisma/client").$Enums.AppointmentType;
        title: string;
        customerId: string;
        calendarId: string;
        startTime: Date;
        endTime: Date;
    })[]>;
    createEvent(userId: string, dto: CreateEventDto): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: import(".prisma/client").$Enums.AppointmentType;
        title: string;
        customerId: string;
        calendarId: string;
        startTime: Date;
        endTime: Date;
    }>;
    updateEvent(eventId: string, dto: UpdateEventDto): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: import(".prisma/client").$Enums.AppointmentType;
        title: string;
        customerId: string;
        calendarId: string;
        startTime: Date;
        endTime: Date;
    }>;
    deleteEvent(eventId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: import(".prisma/client").$Enums.AppointmentType;
        title: string;
        customerId: string;
        calendarId: string;
        startTime: Date;
        endTime: Date;
    }>;
}
