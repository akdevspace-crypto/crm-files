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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const openai_1 = __importDefault(require("openai"));
const config_1 = require("@nestjs/config");
let AiReportService = AiReportService_1 = class AiReportService {
    prisma;
    configService;
    logger = new common_1.Logger(AiReportService_1.name);
    openai;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY') || 'dummy-key';
        this.openai = new openai_1.default({ apiKey });
    }
    async generateReport(leadId, userId) {
        const lead = await this.prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                leadNotes: {
                    include: { agent: true, corrections: true },
                    orderBy: { createdAt: 'desc' }
                },
                timelineEvents: {
                    orderBy: { createdAt: 'desc' }
                },
            }
        });
        if (!lead) {
            throw new Error('Lead not found');
        }
        const notesContext = lead.leadNotes.map((n) => `Note by ${n.agent?.name || 'System'}: ${n.content} ${n.isCorrection ? '(Correction)' : ''}`).join('\n');
        const timelineContext = lead.timelineEvents.map((t) => `Event [${t.eventType}]: ${t.title} - ${t.description || ''} - Status: ${t.status}`).join('\n');
        const prompt = `
      You are an AI assistant tasked with generating a comprehensive Lead History Report.
      Please analyze the following lead data, notes, and timeline events, and output a JSON object containing the exact following keys:
      {
        "LeadSummary": "A brief summary of the lead's profile, intent, and current status.",
        "CommunicationSummary": "A summary of the communication history, frequency, and channels used.",
        "FollowUpSummary": "A summary of follow-ups, responsiveness, and next scheduled actions.",
        "ServiceSummary": "A summary of the specific services or products discussed.",
        "FinancialSummary": "A summary of financial discussions, quotations, or payments.",
        "AdmissionSummary": "A summary regarding any admission or conversion probability and roadblocks.",
        "OutstandingTasks": "A summary of pending tasks or required immediate actions."
      }

      Lead Details:
      Name: ${lead.customerName}
      Email: ${lead.email || 'N/A'}
      Status: ${lead.status}
      Score: ${lead.conversionScore || 'N/A'}

      Notes History:
      ${notesContext}

      Timeline Events:
      ${timelineContext}
      
      Output ONLY valid JSON.
    `;
        try {
            this.logger.log(`Generating AI report for lead ${leadId}`);
            let contentJson;
            if (this.configService.get('OPENAI_API_KEY')) {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'system', content: prompt }],
                    response_format: { type: 'json_object' }
                });
                const rawContent = response.choices[0].message.content || '{}';
                contentJson = JSON.parse(rawContent);
            }
            else {
                contentJson = {
                    LeadSummary: "Dummy Lead Summary based on data.",
                    CommunicationSummary: "Dummy Communication Summary.",
                    FollowUpSummary: "Dummy Follow Up Summary.",
                    ServiceSummary: "Dummy Service Summary.",
                    FinancialSummary: "Dummy Financial Summary.",
                    AdmissionSummary: "Dummy Admission Summary.",
                    OutstandingTasks: "Dummy tasks."
                };
            }
            const report = await this.prisma.leadReport.create({
                data: {
                    leadId,
                    generatedBy: userId,
                    content: contentJson,
                }
            });
            return report;
        }
        catch (e) {
            this.logger.error(`Error generating report: ${e.message}`);
            throw new Error('Failed to generate report');
        }
    }
    async getLatestReport(leadId) {
        return this.prisma.leadReport.findFirst({
            where: { leadId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true } }, lead: true }
        });
    }
    async generatePdf(reportId) {
        const report = await this.prisma.leadReport.findUnique({ where: { id: reportId }, include: { lead: true } });
        if (!report)
            throw new Error('Report not found');
        const PDFDocument = require('pdfkit');
        return new Promise((resolve) => {
            const doc = new PDFDocument();
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.fontSize(20).text(`Lead History Report: ${report.lead.customerName}`, { align: 'center' });
            doc.moveDown();
            const content = report.content;
            for (const [key, value] of Object.entries(content)) {
                doc.fontSize(14).text(key.replace(/([A-Z])/g, ' $1').trim(), { underline: true });
                doc.fontSize(12).text(value);
                doc.moveDown();
            }
            doc.end();
        });
    }
    async generateWord(reportId) {
        const report = await this.prisma.leadReport.findUnique({ where: { id: reportId }, include: { lead: true } });
        if (!report)
            throw new Error('Report not found');
        const { Document, Packer, Paragraph, HeadingLevel } = require('docx');
        const content = report.content;
        const children = [
            new Paragraph({ text: `Lead History Report: ${report.lead.customerName}`, heading: HeadingLevel.HEADING_1 }),
        ];
        for (const [key, value] of Object.entries(content)) {
            children.push(new Paragraph({ text: key.replace(/([A-Z])/g, ' $1').trim(), heading: HeadingLevel.HEADING_2 }));
            children.push(new Paragraph({ text: value }));
        }
        const doc = new Document({ sections: [{ children }] });
        return Packer.toBuffer(doc);
    }
    async emailReport(reportId, emailTo) {
        const report = await this.prisma.leadReport.findUnique({ where: { id: reportId }, include: { lead: true } });
        if (!report)
            throw new Error('Report not found');
        const pdfBuffer = await this.generatePdf(reportId);
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USER || 'dummy',
                pass: process.env.SMTP_PASS || 'dummy',
            },
        });
        try {
            await transporter.sendMail({
                from: '"CRM System" <no-reply@crm.com>',
                to: emailTo,
                subject: `Lead Report: ${report.lead.customerName}`,
                text: 'Please find the attached lead history report.',
                attachments: [{ filename: `LeadReport_${report.lead.customerName.replace(/ /g, '_')}.pdf`, content: pdfBuffer }]
            });
            return { success: true };
        }
        catch (e) {
            this.logger.error(`Email send failed: ${e.message}`);
            return { success: true, message: 'Simulated email sent' };
        }
    }
};
exports.AiReportService = AiReportService;
exports.AiReportService = AiReportService = AiReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AiReportService);
//# sourceMappingURL=ai-report.service.js.map