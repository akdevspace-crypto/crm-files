import { Redis } from 'ioredis';
export declare class NotificationService {
    private readonly redis;
    private readonly logger;
    constructor(redis: Redis);
    triggerSlaAlert(queueId: string, waitTime: number): Promise<void>;
}
