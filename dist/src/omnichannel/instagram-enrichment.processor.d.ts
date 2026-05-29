import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InstagramProfileEnrichmentService } from './instagram-enrichment.service';
export declare class InstagramEnrichmentProcessor extends WorkerHost {
    private readonly enrichmentService;
    private readonly logger;
    constructor(enrichmentService: InstagramProfileEnrichmentService);
    process(job: Job<any, any, string>): Promise<any>;
}
