import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateCallSummary(sessionId: string, transcript: string) {
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

    // In production: Call Google Gemini 2.5 API here with the prompt
    // const response = await gemini.generateContent({ prompt, ... })

    // Simulating parsed AI Response
    const aiResponse = {
      summary:
        'Customer called regarding a billing discrepancy for their mobility plan. Agent agreed to refund the difference.',
      sentiment: 'NEUTRAL',
      escalationRisk: 'LOW',
      actionItems: [
        'Process refund of $15.00',
        'Email updated invoice to customer',
      ],
    };

    // Persist to Database
    await this.prisma.aiSummary.create({
      data: {
        conversationId: sessionId, // Assuming conversation mapping
        summaryText: aiResponse.summary,
        sentimentScore: aiResponse.sentiment,
        riskLevel: aiResponse.escalationRisk,
      },
    });

    return aiResponse;
  }
}
