import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
export declare class AiSpeechService {
    private readonly prisma;
    private readonly timelineService;
    private readonly logger;
    constructor(prisma: PrismaService, timelineService: TimelineService);
    processSpeechIntelligence(callSessionId: string): Promise<{
        id: string;
        createdAt: Date;
        callSessionId: string;
        originalTranscript: string | null;
        englishTranslation: string | null;
        detectedLanguage: string | null;
        summary: string | null;
        customerIntent: string | null;
        sentiment: string | null;
        sentimentScore: number | null;
        actionItems: import("@prisma/client/runtime/library").JsonValue | null;
        followUpRecommendation: string | null;
        silenceRatio: number | null;
        talkRatio: number | null;
    } | undefined>;
}
