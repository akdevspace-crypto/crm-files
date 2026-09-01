"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
let AutomationService = AutomationService_1 = class AutomationService {
    prisma;
    eventEmitter;
    logger = new common_1.Logger(AutomationService_1.name);
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async handleAllEvents(event, payload) {
        this.logger.debug(`[Automation Engine] Received Event: ${event}`);
        const triggerType = event.toUpperCase().replace(/\./g, '_');
        const activeRules = await this.prisma.workflowAutomation.findMany({
            where: { isActive: true, triggerType },
        });
        if (activeRules.length === 0)
            return;
        this.logger.log(`Found ${activeRules.length} rules matching event ${event} (${triggerType})`);
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
            }
            catch (error) {
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
    async executeRule(rule, payload) {
        this.logger.log(`Executing Action: ${rule.actionType} for Rule: ${rule.name}`);
        switch (rule.actionType) {
            case 'CREATE_TICKET':
                this.logger.log(`[Action Engine] Creating ticket. Context: ${JSON.stringify(payload)}`);
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
                    this.eventEmitter.emit('call.outbound.requested', payload);
                }
                else {
                    this.logger.warn(`Cannot trigger outbound call: no phone number found in payload.`);
                }
                break;
            default:
                this.logger.warn(`Unknown action type: ${rule.actionType}`);
        }
    }
};
exports.AutomationService = AutomationService;
__decorate([
    (0, event_emitter_1.OnEvent)('**'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AutomationService.prototype, "handleAllEvents", null);
exports.AutomationService = AutomationService = AutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], AutomationService);
//# sourceMappingURL=automation.service.js.map