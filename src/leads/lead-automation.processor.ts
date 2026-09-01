import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { LeadsRepository } from './leads.repository';
import { TelephonyService } from '../telephony/telephony.service';

@Processor('lead_automation')
export class LeadAutomationProcessor extends WorkerHost {
  private readonly logger = new Logger(LeadAutomationProcessor.name);

  constructor(
    private readonly leadsRepo: LeadsRepository,
    @Inject(forwardRef(() => TelephonyService))
    private readonly telephonyService: TelephonyService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.name} for lead ${job.data.leadId}`);
    
    if (job.name === 'check_lead_timeout') {
      const leadId = job.data.leadId;
      const lead = await this.leadsRepo.findById(leadId);
      
      if (!lead) {
        this.logger.warn(`Lead ${leadId} not found`);
        return;
      }

      if (lead.status === 'NEW') {
        this.logger.log(`Lead ${leadId} is still NEW after timeout. Triggering AI Call Bot.`);
        // Trigger AI Call Bot
        await this.telephonyService.triggerAiCallBot(lead);
      } else {
        this.logger.log(`Lead ${leadId} status is ${lead.status}. No AI action needed.`);
      }
    }
  }
}
