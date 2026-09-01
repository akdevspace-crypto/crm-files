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
var VoiceAssistantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceAssistantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const live_gateway_1 = require("../websockets/live.gateway");
let VoiceAssistantService = VoiceAssistantService_1 = class VoiceAssistantService {
    prisma;
    liveGateway;
    logger = new common_1.Logger(VoiceAssistantService_1.name);
    constructor(prisma, liveGateway) {
        this.prisma = prisma;
        this.liveGateway = liveGateway;
    }
    async processIncomingVoiceMessage(conversationId, audioUrl) {
        this.logger.log(`Processing incoming voice message for conversation ${conversationId}`);
        try {
            await this.prisma.message.create({
                data: {
                    conversationId,
                    senderType: 'AI',
                    content: "Thank you for your voice message. I'm analysing it now. Please wait a moment.",
                    status: 'SENT',
                }
            });
            this.logger.log(`Sent 'Please wait' message to customer.`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            const detectedLanguage = 'Tamil';
            const originalTranscript = "எனக்கு ஒரு புதிய சேவை திட்டம் தேவை, அதை எப்படி பெறுவது?";
            const englishTranslation = "I need a new service plan, how do I get it?";
            const aiIntent = "Plan Upgrade Inquiry";
            const aiResponse = "Hello! I'd be happy to help you upgrade your service plan. Our premium package includes 24/7 care support and priority doctor visits. Shall I send you the pricing details?";
            const customerMessage = await this.prisma.message.findFirst({
                where: {
                    conversationId,
                    senderType: 'CUSTOMER',
                    attachmentType: 'audio'
                },
                orderBy: { createdAt: 'desc' }
            });
            if (customerMessage) {
                const updatedCustomerMessage = await this.prisma.message.update({
                    where: { id: customerMessage.id },
                    data: {
                        transcript: originalTranscript,
                        translation: englishTranslation,
                        detectedLanguage,
                        aiIntent,
                        aiResponse
                    }
                });
                this.liveGateway.server.emit('new_message', {
                    conversationId,
                    message: updatedCustomerMessage
                });
            }
            const aiSuggestedReply = await this.prisma.message.create({
                data: {
                    conversationId,
                    senderType: 'AI',
                    content: aiResponse,
                    status: 'SENT',
                    isAiSuggested: true
                }
            });
            this.liveGateway.server.emit('new_message', {
                conversationId,
                message: aiSuggestedReply
            });
            this.logger.log(`AI Voice Analysis completed and suggested reply generated.`);
        }
        catch (error) {
            this.logger.error(`Failed to process voice message: ${error.message}`, error.stack);
        }
    }
};
exports.VoiceAssistantService = VoiceAssistantService;
exports.VoiceAssistantService = VoiceAssistantService = VoiceAssistantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        live_gateway_1.LiveGateway])
], VoiceAssistantService);
//# sourceMappingURL=voice-assistant.service.js.map