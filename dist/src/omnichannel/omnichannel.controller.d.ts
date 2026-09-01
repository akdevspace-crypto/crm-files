import { VoiceAssistantService } from './voice-assistant.service';
export declare class OmnichannelController {
    private readonly voiceAssistantService;
    private readonly logger;
    constructor(voiceAssistantService: VoiceAssistantService);
    handleMockVoiceMessage(body: {
        conversationId: string;
        audioUrl: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
