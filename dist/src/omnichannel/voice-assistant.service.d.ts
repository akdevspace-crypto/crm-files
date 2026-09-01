import { PrismaService } from '../prisma/prisma.service';
import { LiveGateway } from '../websockets/live.gateway';
export declare class VoiceAssistantService {
    private readonly prisma;
    private readonly liveGateway;
    private readonly logger;
    constructor(prisma: PrismaService, liveGateway: LiveGateway);
    processIncomingVoiceMessage(conversationId: string, audioUrl: string): Promise<void>;
}
