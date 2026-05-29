export function analyzeLeadSentiment(transcript: any, agentNotes: any): Promise<any>;
export function analyzeAndSaveConversation(conversationId: any, io: any): Promise<{
    id: string;
    createdAt: Date;
    conversationId: string;
    summaryText: string;
    sentimentScore: string;
    riskLevel: string;
} | undefined>;
