import { Controller, Post, Body, Logger } from '@nestjs/common';
import { VoiceAssistantService } from './voice-assistant.service';

@Controller('omnichannel')
export class OmnichannelController {
  private readonly logger = new Logger(OmnichannelController.name);

  constructor(private readonly voiceAssistantService: VoiceAssistantService) {}

  @Post('mock-voice-message')
  async handleMockVoiceMessage(@Body() body: { conversationId: string; audioUrl: string }) {
    this.logger.log(`Received mock voice message for conv: ${body.conversationId}`);
    
    // Trigger the async processing pipeline without blocking the HTTP response
    this.voiceAssistantService.processIncomingVoiceMessage(body.conversationId, body.audioUrl)
      .catch(err => this.logger.error(`Error in voice pipeline: ${err.message}`));

    return { success: true, message: 'Voice message received and processing started.' };
  }
}
