import { CalendarService } from './calendar.service';
import { CreateEventDto, UpdateEventDto } from './dto/calendar.dto';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    getEvents(req: any): Promise<({
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
    createEvent(req: any, dto: CreateEventDto): Promise<{
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
    updateEvent(id: string, dto: UpdateEventDto): Promise<{
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
    deleteEvent(id: string): Promise<{
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
