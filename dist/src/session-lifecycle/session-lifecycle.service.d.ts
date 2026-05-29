import { Redis } from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
export declare class SessionLifecycleService {
    private readonly redis;
    private readonly prisma;
    private readonly logger;
    constructor(redis: Redis, prisma: PrismaService);
    createCallSession(agentId: string, customerId: string, queueId?: string): Promise<{
        id: string;
    }>;
    recoverSession(agentId: string): Promise<any>;
    endCallSession(agentId: string, sessionId: string): Promise<void>;
}
