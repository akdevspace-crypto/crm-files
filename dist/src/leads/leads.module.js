"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsModule = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("./leads.service");
const leads_controller_1 = require("./leads.controller");
const website_webhook_controller_1 = require("./website-webhook.controller");
const leads_repository_1 = require("./leads.repository");
const auth_module_1 = require("../auth/auth.module");
const bullmq_1 = require("@nestjs/bullmq");
const lead_automation_processor_1 = require("./lead-automation.processor");
const telephony_module_1 = require("../telephony/telephony.module");
const timeline_module_1 = require("../timeline/timeline.module");
const ai_report_service_1 = require("./ai-report.service");
let LeadsModule = class LeadsModule {
};
exports.LeadsModule = LeadsModule;
exports.LeadsModule = LeadsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            bullmq_1.BullModule.registerQueue({ name: 'lead_automation' }),
            (0, common_1.forwardRef)(() => telephony_module_1.TelephonyModule),
            timeline_module_1.TimelineModule,
        ],
        controllers: [leads_controller_1.LeadsController, website_webhook_controller_1.WebsiteWebhookController],
        providers: [leads_service_1.LeadsService, leads_repository_1.LeadsRepository, lead_automation_processor_1.LeadAutomationProcessor, ai_report_service_1.AiReportService],
        exports: [leads_service_1.LeadsService, ai_report_service_1.AiReportService],
    })
], LeadsModule);
//# sourceMappingURL=leads.module.js.map