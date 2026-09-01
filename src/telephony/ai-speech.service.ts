import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class AiSpeechService {
  private readonly logger = new Logger(AiSpeechService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineService: TimelineService
  ) {}

  /**
   * Process a completed call session to generate AI speech intelligence.
   * This is a mocked implementation that simulates language detection,
   * transcription, translation, and NLP extraction.
   */
  async processSpeechIntelligence(callSessionId: string) {
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

      // Simulate AI processing delay (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const languages = ['Tamil', 'Hindi', 'English'];
      const detectedLanguage = languages[Math.floor(Math.random() * languages.length)];

      let originalTranscript = '';
      let englishTranslation = '';

      if (detectedLanguage === 'Tamil') {
        originalTranscript = "வணக்கம். நான் உங்கள் பில்லிங் அறிக்கை பற்றி விசாரிக்க அழைக்கிறேன். எனக்கு ஒரு சந்தேகம் உள்ளது.";
        englishTranslation = "Hello. I am calling to inquire about my billing statement. I have a doubt.";
      } else if (detectedLanguage === 'Hindi') {
        originalTranscript = "नमस्ते। मैं अपने बिलिंग स्टेटमेंट के बारे में पूछने के लिए कॉल कर रहा हूँ।";
        englishTranslation = "Hello. I am calling to ask about my billing statement.";
      } else {
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

      // Push CRM Note / Timeline Event
      if (callSession.customerId) {
        // If this customer is also a Lead, we could push to LeadNote. 
        // For now, TimelineEvent covers both Customer and Lead timeline views.
        const agentParticipant = callSession.participants.find(p => p.role === 'AGENT');
        const userId = agentParticipant?.agentId; // In our system, agentId maps to the User or Agent.

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
    } catch (error) {
      this.logger.error(`Failed to process speech intelligence: ${error.message}`, error.stack);
    }
  }
}
