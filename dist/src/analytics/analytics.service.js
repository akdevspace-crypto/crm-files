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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    prisma;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateCallSummary(sessionId, transcript) {
        this.logger.log(`Generating AI summary for session ${sessionId}...`);
        const prompt = `
      Analyze the following customer service call transcript from an ElderCare CRM platform.
      
      Transcript:
      """${transcript}"""
      
      Extract the following information and format it strictly as a JSON object:
      {
        "summary": "A concise 2-sentence summary of the interaction.",
        "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        "escalationRisk": "LOW" | "MEDIUM" | "HIGH",
        "actionItems": ["array of follow-up tasks for the agent"]
      }
    `;
        const aiResponse = {
            summary: 'Customer called regarding a billing discrepancy for their mobility plan. Agent agreed to refund the difference.',
            sentiment: 'NEUTRAL',
            escalationRisk: 'LOW',
            actionItems: [
                'Process refund of $15.00',
                'Email updated invoice to customer',
            ],
        };
        await this.prisma.aiSummary.create({
            data: {
                conversationId: sessionId,
                summaryText: aiResponse.summary,
                sentimentScore: aiResponse.sentiment,
                riskLevel: aiResponse.escalationRisk,
            },
        });
        return aiResponse;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map