import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveGateway } from '../websockets/live.gateway';

@Injectable()
export class VoiceAssistantService {
  private readonly logger = new Logger(VoiceAssistantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly liveGateway: LiveGateway,
  ) {}

  /**
   * Process an incoming voice message
   * @param conversationId The ID of the conversation
   * @param audioUrl The URL of the audio attachment
   */
  async processIncomingVoiceMessage(conversationId: string, audioUrl: string) {
    this.logger.log(`Processing incoming voice message for conversation ${conversationId}`);
    
    try {
      // 1. Send immediate automated reply
      await this.prisma.message.create({
        data: {
          conversationId,
          senderType: 'AI',
          content: "Thank you for your voice message. I'm analysing it now. Please wait a moment.",
          status: 'SENT',
        }
      });
      
      this.logger.log(`Sent 'Please wait' message to customer.`);

      // 2. Simulate AI Processing Delay (Speech-to-text, Translation, Intent)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const detectedLanguage = 'Tamil';
      const originalTranscript = "எனக்கு ஒரு புதிய சேவை திட்டம் தேவை, அதை எப்படி பெறுவது?";
      const englishTranslation = "I need a new service plan, how do I get it?";
      const aiIntent = "Plan Upgrade Inquiry";
      
      // 3. Generate the suggested reply
      const aiResponse = "Hello! I'd be happy to help you upgrade your service plan. Our premium package includes 24/7 care support and priority doctor visits. Shall I send you the pricing details?";

      // 4. Update the original customer message with insights
      // We assume the customer's audio message was just created before calling this function
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
        // Emit an event to tell the frontend the voice note was transcribed
        this.liveGateway.server.emit('new_message', {
          conversationId,
          message: updatedCustomerMessage
        });
      }

      // 5. Create the AI Suggested Reply for the Agent
      const aiSuggestedReply = await this.prisma.message.create({
        data: {
          conversationId,
          senderType: 'AI',
          content: aiResponse,
          status: 'SENT',
          isAiSuggested: true // Flags it for agent review
        }
      });
      
      // Emit the suggested reply to the frontend
      this.liveGateway.server.emit('new_message', {
        conversationId,
        message: aiSuggestedReply
      });
      
      this.logger.log(`AI Voice Analysis completed and suggested reply generated.`);

    } catch (error) {
      this.logger.error(`Failed to process voice message: ${error.message}`, error.stack);
    }
  }
}
