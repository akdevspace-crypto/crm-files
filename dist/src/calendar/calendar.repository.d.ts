import { PrismaService } from '../prisma/prisma.service';
export declare class CalendarRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOrCreateCalendar(agentId: string): Promise<{
        id: string;
        agentId: string;
    }>;
    findMany(calendarId: string): Promise<({
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
    findAll(): Promise<({
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
    findByUserId(userId: string): Promise<({
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
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        type: import(".prisma/client").$Enums.AppointmentType;
        title: string;
        customerId: string;
        calendarId: string;
        startTime: Date;
        endTime: Date;
    } | null>;
    create(calendarId: string, customerId: string, data: any): Promise<{
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
    createWithUserId(userId: string, customerId: string, data: any): Promise<{
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
    update(id: string, data: any): Promise<{
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
    delete(id: string): Promise<{
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
