import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('**')
  async handleAllEvents(event: string, payload: any) {
    this.logger.debug(`[Automation Engine] Received Event: ${event}`);
    
    // Normalize event name to match triggerType enum format (e.g. 'call.analyzed' -> 'CALL_ANALYZED')
    const triggerType = event.toUpperCase().replace(/\./g, '_');

    // 1. Fetch active rules for this trigger type
    const activeRules = await this.prisma.workflowAutomation.findMany({
      where: { isActive: true, triggerType },
    });

    if (activeRules.length === 0) return;

    this.logger.log(`Found ${activeRules.length} rules matching event ${event} (${triggerType})`);

    // 2. Evaluate and Execute
    for (const rule of activeRules) {
      try {
        await this.executeRule(rule, payload);
        
        await this.prisma.automationTrigger.create({
          data: {
            workflowId: rule.id,
            targetId: payload?.id || payload?.callSessionId || payload?.ticketId || 'UNKNOWN',
            status: 'SUCCESS',
            executionLog: `Executed action: ${rule.actionType}`,
            executedAt: new Date(),
          }
        });
      } catch (error) {
        this.logger.error(`Failed to execute rule ${rule.name}`, error);
        await this.prisma.automationTrigger.create({
          data: {
            workflowId: rule.id,
            targetId: payload?.id || payload?.callSessionId || payload?.ticketId || 'UNKNOWN',
            status: 'FAILED',
            executionLog: `Error: ${error.message}`,
            executedAt: new Date(),
          }
        });
      }
    }
  }

  private async executeRule(rule: any, payload: any) {
    this.logger.log(`Executing Action: ${rule.actionType} for Rule: ${rule.name}`);
    
    switch (rule.actionType) {
      case 'CREATE_TICKET':
        this.logger.log(`[Action Engine] Creating ticket. Context: ${JSON.stringify(payload)}`);
        // If it was a real implementation, we'd query the agent and customer context and create a Ticket record here.
        break;
      case 'ESCALATE':
        this.logger.log(`[Action Engine] Escalating item. Context: ${JSON.stringify(payload)}`);
        break;
      case 'SEND_WHATSAPP':
        this.logger.log(`[Action Engine] Sending WhatsApp. Context: ${JSON.stringify(payload)}`);
        break;
      case 'TRIGGER_OUTBOUND_CALL':
        this.logger.log(`[Action Engine] Triggering Outbound Call. Context: ${JSON.stringify(payload)}`);
        if (payload?.phoneNumber) {
          // Emit a sub-event for the Telephony subsystem so we don't create circular dependencies
          this.eventEmitter.emit('call.outbound.requested', payload);
        } else {
          this.logger.warn(`Cannot trigger outbound call: no phone number found in payload.`);
        }
        break;
      default:
        this.logger.warn(`Unknown action type: ${rule.actionType}`);
    }
  }
}
