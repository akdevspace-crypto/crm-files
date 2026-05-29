import { Queue } from 'bullmq';
export declare class QueueOrchestrationService {
    private supportQueue;
    private salesQueue;
    private readonly logger;
    constructor(supportQueue: Queue, salesQueue: Queue);
    enqueueCall(callData: any, type: 'support' | 'sales'): Promise<void>;
    allocateAgent(department?: string): Promise<any | null>;
    getQueueMetrics(): Promise<{
        supportCount: number;
        salesCount: number;
    }>;
}
