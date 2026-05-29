import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateCallSummary(sessionId: string, transcript: string): Promise<{
        summary: string;
        sentiment: string;
        escalationRisk: string;
        actionItems: string[];
    }>;
}
