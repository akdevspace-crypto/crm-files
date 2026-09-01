import { Module, forwardRef } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { WebsiteWebhookController } from './website-webhook.controller';
import { LeadsRepository } from './leads.repository';
import { AuthModule } from '../auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { LeadAutomationProcessor } from './lead-automation.processor';
import { TelephonyModule } from '../telephony/telephony.module';
import { TimelineModule } from '../timeline/timeline.module';
import { AiReportService } from './ai-report.service';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({ name: 'lead_automation' }),
    forwardRef(() => TelephonyModule),
    TimelineModule,
  ],
  controllers: [LeadsController, WebsiteWebhookController],
  providers: [LeadsService, LeadsRepository, LeadAutomationProcessor, AiReportService],
  exports: [LeadsService, AiReportService],
})
export class LeadsModule {}
