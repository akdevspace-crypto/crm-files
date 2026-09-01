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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteWebhookController = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("./leads.service");
const swagger_1 = require("@nestjs/swagger");
let WebsiteWebhookController = class WebsiteWebhookController {
    leadsService;
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async handleWebsiteEnquiry(body) {
        const lead = await this.leadsService.createLead({
            customerName: body.name || 'Website Visitor',
            phoneNumber: body.phoneNumber,
            email: body.email,
            serviceInterest: body.serviceInterest,
            notes: body.notes,
            source: 'Website',
        }, undefined);
        return { success: true, leadId: lead.id };
    }
};
exports.WebsiteWebhookController = WebsiteWebhookController;
__decorate([
    (0, common_1.Post)('enquiry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Public webhook for website enquiry form submissions' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebsiteWebhookController.prototype, "handleWebsiteEnquiry", null);
exports.WebsiteWebhookController = WebsiteWebhookController = __decorate([
    (0, swagger_1.ApiTags)('website-integrations'),
    (0, common_1.Controller)('v1/integrations/website'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], WebsiteWebhookController);
//# sourceMappingURL=website-webhook.controller.js.map