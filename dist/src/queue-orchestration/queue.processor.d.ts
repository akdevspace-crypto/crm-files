import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AgentService } from '../agent/agent.service';
export declare class SupportQueueProcessor extends WorkerHost {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    process(job: Job<any, any, string>): Promise<any>;
}
