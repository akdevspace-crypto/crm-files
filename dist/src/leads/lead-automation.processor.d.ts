import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LeadsRepository } from './leads.repository';
import { TelephonyService } from '../telephony/telephony.service';
export declare class LeadAutomationProcessor extends WorkerHost {
    private readonly leadsRepo;
    private readonly telephonyService;
    private readonly logger;
    constructor(leadsRepo: LeadsRepository, telephonyService: TelephonyService);
    process(job: Job<any, any, string>): Promise<any>;
}
