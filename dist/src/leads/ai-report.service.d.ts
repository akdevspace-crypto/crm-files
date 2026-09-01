import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AiReportService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    private openai;
    constructor(prisma: PrismaService, configService: ConfigService);
    generateReport(leadId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        leadId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        generatedBy: string;
    }>;
    getLatestReport(leadId: string): Promise<({
        user: {
            email: string;
        };
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
        };
    } & {
        id: string;
        createdAt: Date;
        leadId: string;
        content: import("@prisma/client/runtime/library").JsonValue;
        generatedBy: string;
    }) | null>;
    generatePdf(reportId: string): Promise<Buffer>;
    generateWord(reportId: string): Promise<Buffer>;
    emailReport(reportId: string, emailTo: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
}
