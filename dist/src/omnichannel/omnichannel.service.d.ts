import { PrismaService } from '../prisma/prisma.service';
export declare class OmnichannelService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleIncomingMessage(channel: string, senderId: string, content: string): Promise<void>;
    sendQuickReply(agentId: string, customerId: string, message: string, channel: string): Promise<void>;
}
