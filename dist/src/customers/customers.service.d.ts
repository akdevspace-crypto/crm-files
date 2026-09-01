import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
export declare class CustomersService {
    private readonly prisma;
    private readonly timelineService;
    private readonly logger;
    constructor(prisma: PrismaService, timelineService: TimelineService);
    mergeCustomers(primaryId: string, duplicateId: string, adminUserId: string): Promise<{
        message: string;
        primaryId: string;
    }>;
}
