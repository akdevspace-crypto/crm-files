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
var AiSpeechService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSpeechService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const timeline_service_1 = require("../timeline/timeline.service");
let AiSpeechService = AiSpeechService_1 = class AiSpeechService {
    prisma;
    timelineService;
    logger = new common_1.Logger(AiSpeechService_1.name);
    constructor(prisma, timelineService) {
        this.prisma = prisma;
        this.timelineService = timelineService;
    }
    async processSpeechIntelligence(callSessionId) {
        this.logger.log(`Starting AI Speech Intelligence pipeline for call ${callSessionId}`);
        try {
            const callSession = await this.prisma.callSession.findUnique({
                where: { id: callSessionId },
                include: { customer: true, participants: true }
            });
            if (!callSession) {
                this.logger.warn(`CallSession ${callSessionId} not found`);
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const languages = ['Tamil', 'Hindi', 'English'];
            const detectedLanguage = languages[Math.floor(Math.random() * languages.length)];
            let originalTranscript = '';
            let englishTranslation = '';
            if (detectedLanguage === 'Tamil') {
                originalTranscript = "வணக்கம். நான் உங்கள் பில்லிங் அறிக்கை பற்றி விசாரிக்க அழைக்கிறேன். எனக்கு ஒரு சந்தேகம் உள்ளது.";
                englishTranslation = "Hello. I am calling to inquire about my billing statement. I have a doubt.";
            }
            else if (detectedLanguage === 'Hindi') {
                originalTranscript = "नमस्ते। मैं अपने बिलिंग स्टेटमेंट के बारे में पूछने के लिए कॉल कर रहा हूँ।";
                englishTranslation = "Hello. I am calling to ask about my billing statement.";
            }
            else {
                originalTranscript = "Hello. I am calling to inquire about my billing statement. I have a doubt.";
                englishTranslation = originalTranscript;
            }
            const summary = `Customer (${callSession.customer?.name || 'Unknown'}) called to discuss their recent billing statement. They were seeking clarification on some charges. The agent explained the charges successfully.`;
            const customerIntent = "Billing Inquiry";
            const sentiment = Math.random() > 0.5 ? "Positive" : "Neutral";
            const actionItems = [
                "Email the detailed breakdown of the latest invoice",
                "Follow up next week to ensure customer satisfaction"
            ];
            const followUpRecommendation = "Call back in 7 days to check if the issue is fully resolved.";
            const analytics = await this.prisma.callAnalytics.upsert({
                where: { callSessionId: callSession.id },
                update: {
                    originalTranscript,
                    englishTranslation,
                    detectedLanguage,
                    summary,
                    customerIntent,
                    sentiment,
                    sentimentScore: sentiment === 'Positive' ? 8.5 : 5.0,
                    actionItems,
                    followUpRecommendation
                },
                create: {
                    callSessionId: callSession.id,
                    originalTranscript,
                    englishTranslation,
                    detectedLanguage,
                    summary,
                    customerIntent,
                    sentiment,
                    sentimentScore: sentiment === 'Positive' ? 8.5 : 5.0,
                    actionItems,
                    followUpRecommendation
                }
            });
            this.logger.log(`Call Analytics generated for ${callSessionId}`);
            if (callSession.customerId) {
                const agentParticipant = callSession.participants.find(p => p.role === 'AGENT');
                const userId = agentParticipant?.agentId;
                await this.prisma.clientTimelineEvent.create({
                    data: {
                        customerId: callSession.customerId,
                        eventType: 'NOTE',
                        title: 'AI Call Summary Generated',
                        description: summary + `\n\nIntent: ${customerIntent}\nSentiment: ${sentiment}\nActions: ${actionItems.join(', ')}`,
                        status: 'COMPLETED',
                        source: 'AI Speech Engine'
                    }
                });
                this.logger.log(`Added CRM Note to Timeline for customer ${callSession.customerId}`);
            }
            return analytics;
        }
        catch (error) {
            this.logger.error(`Failed to process speech intelligence: ${error.message}`, error.stack);
        }
    }
};
exports.AiSpeechService = AiSpeechService;
exports.AiSpeechService = AiSpeechService = AiSpeechService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        timeline_service_1.TimelineService])
], AiSpeechService);
//# sourceMappingURL=ai-speech.service.js.map