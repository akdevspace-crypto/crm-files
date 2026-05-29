import { PrismaService } from '../prisma/prisma.service';
import { Redis } from 'ioredis';
export declare class InstagramProfileEnrichmentService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: Redis);
    enrichProfile(customerId: string, platformUserId: string): Promise<any>;
    private updateCustomerIdentity;
}
