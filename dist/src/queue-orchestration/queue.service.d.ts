import { PrismaService } from '../prisma/prisma.service';
export declare class QueueService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    allocateAgent(department?: string): Promise<any | null>;
}
