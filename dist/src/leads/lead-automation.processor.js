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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LeadAutomationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadAutomationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const leads_repository_1 = require("./leads.repository");
const telephony_service_1 = require("../telephony/telephony.service");
let LeadAutomationProcessor = LeadAutomationProcessor_1 = class LeadAutomationProcessor extends bullmq_1.WorkerHost {
    leadsRepo;
    telephonyService;
    logger = new common_1.Logger(LeadAutomationProcessor_1.name);
    constructor(leadsRepo, telephonyService) {
        super();
        this.leadsRepo = leadsRepo;
        this.telephonyService = telephonyService;
    }
    async process(job) {
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
                await this.telephonyService.triggerAiCallBot(lead);
            }
            else {
                this.logger.log(`Lead ${leadId} status is ${lead.status}. No AI action needed.`);
            }
        }
    }
};
exports.LeadAutomationProcessor = LeadAutomationProcessor;
exports.LeadAutomationProcessor = LeadAutomationProcessor = LeadAutomationProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('lead_automation'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => telephony_service_1.TelephonyService))),
    __metadata("design:paramtypes", [leads_repository_1.LeadsRepository,
        telephony_service_1.TelephonyService])
], LeadAutomationProcessor);
//# sourceMappingURL=lead-automation.processor.js.map