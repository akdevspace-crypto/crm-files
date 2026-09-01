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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("./leads.service");
const lead_dto_1 = require("./dto/lead.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const rbac_guard_1 = require("../auth/rbac.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
const ai_report_service_1 = require("./ai-report.service");
let LeadsController = class LeadsController {
    leadsService;
    aiReportService;
    constructor(leadsService, aiReportService) {
        this.leadsService = leadsService;
        this.aiReportService = aiReportService;
    }
    async getLeads(req, status, agentId) {
        const userRole = req.user.role;
        const reqAgentId = req.user.id;
        return this.leadsService.getLeads(status, agentId, userRole, reqAgentId);
    }
    async createLead(req, dto) {
        return this.leadsService.createLead(dto, req.user.id);
    }
    async claimLead(req, id) {
        return this.leadsService.claimLead(id, req.user.id);
    }
    async updateStatus(req, id, dto) {
        return this.leadsService.updateLeadStatus(id, req.user.id, dto);
    }
    async getLeadNotes(id) {
        return this.leadsService.getLeadNotes(id);
    }
    async appendLeadNote(req, id, dto) {
        return this.leadsService.appendLeadNote(id, req.user.id, dto);
    }
    async appendCorrectionNote(req, leadId, noteId, dto) {
        return this.leadsService.appendCorrectionNote(leadId, req.user.id, noteId, dto.content);
    }
    async generateReport(req, id) {
        return this.aiReportService.generateReport(id, req.user.id);
    }
    async getLatestReport(id) {
        return this.aiReportService.getLatestReport(id);
    }
    async exportReportPdf(reportId, req, res) {
        const buffer = await this.aiReportService.generatePdf(reportId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=report-${reportId}.pdf`,
        });
        res.send(buffer);
    }
    async exportReportWord(reportId, req, res) {
        const buffer = await this.aiReportService.generateWord(reportId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=report-${reportId}.docx`,
        });
        res.send(buffer);
    }
    async emailReport(reportId, emailTo) {
        return this.aiReportService.emailReport(reportId, emailTo);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Read'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve all leads with dynamic PII masking' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('agentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getLeads", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Create'),
    (0, swagger_1.ApiOperation)({ summary: 'Log a new manual lead record' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lead_dto_1.CreateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "createLead", null);
__decorate([
    (0, common_1.Post)(':id/claim'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Claim'),
    (0, swagger_1.ApiOperation)({ summary: 'Acquire lock and claim lead from unassigned pool' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "claimLead", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Update'),
    (0, swagger_1.ApiOperation)({ summary: 'Transition lead pipeline status' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, lead_dto_1.LeadStatusUpdateDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(':id/notes'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit notes for a lead' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getLeadNotes", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Update'),
    (0, swagger_1.ApiOperation)({ summary: 'Append a new note to a lead' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, lead_dto_1.CreateLeadNoteDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "appendLeadNote", null);
__decorate([
    (0, common_1.Post)(':id/notes/:noteId/correction'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Update'),
    (0, swagger_1.ApiOperation)({ summary: 'Append a correction to an existing note' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('noteId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "appendCorrectionNote", null);
__decorate([
    (0, common_1.Post)(':id/report/generate'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Read'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI Lead History Report' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)(':id/report'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest Lead History Report' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getLatestReport", null);
__decorate([
    (0, common_1.Get)('report/:reportId/export/pdf'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Read'),
    (0, swagger_1.ApiOperation)({ summary: 'Export Report as PDF' }),
    __param(0, (0, common_1.Param)('reportId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "exportReportPdf", null);
__decorate([
    (0, common_1.Get)('report/:reportId/export/word'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Read'),
    (0, swagger_1.ApiOperation)({ summary: 'Export Report as Word' }),
    __param(0, (0, common_1.Param)('reportId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "exportReportWord", null);
__decorate([
    (0, common_1.Post)('report/:reportId/email'),
    (0, permissions_decorator_1.RequirePermissions)('Lead.Read'),
    (0, swagger_1.ApiOperation)({ summary: 'Email Lead Report' }),
    __param(0, (0, common_1.Param)('reportId')),
    __param(1, (0, common_1.Body)('emailTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "emailReport", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('leads'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService,
        ai_report_service_1.AiReportService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map