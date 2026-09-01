import type { Request } from 'express';
import { LivekitService } from './livekit.service';
import { TelephonyService } from './telephony.service';
import { TelephonyGateway } from './telephony.gateway';
import { QueueService } from '../queue-orchestration/queue.service';
export declare class TelephonyController {
    private readonly livekitService;
    private readonly telephonyService;
    private readonly telephonyGateway;
    private readonly queueService;
    private readonly logger;
    constructor(livekitService: LivekitService, telephonyService: TelephonyService, telephonyGateway: TelephonyGateway, queueService: QueueService);
    getDashboardCalls(): Promise<{
        queuedCalls: ({
            customer: {
                name: string;
                phone: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CallStatus;
            customerId: string | null;
            conversationId: string | null;
            callerUserId: string | null;
            calleeUserId: string | null;
            startedAt: Date | null;
            endedAt: Date | null;
            duration: number | null;
            recordingUrl: string | null;
            reason: string | null;
            livekitRoom: string | null;
            transferHistory: import("@prisma/client/runtime/library").JsonValue | null;
            holdDuration: number | null;
        })[];
        missedCalls: ({
            customer: {
                name: string;
                phone: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CallStatus;
            customerId: string | null;
            conversationId: string | null;
            callerUserId: string | null;
            calleeUserId: string | null;
            startedAt: Date | null;
            endedAt: Date | null;
            duration: number | null;
            recordingUrl: string | null;
            reason: string | null;
            livekitRoom: string | null;
            transferHistory: import("@prisma/client/runtime/library").JsonValue | null;
            holdDuration: number | null;
        })[];
    }>;
    getAiSummaries(): Promise<({
        callSession: {
            customer: {
                name: string;
                phone: string;
            } | null;
            participants: {
                id: string;
                role: string;
                joinedAt: Date;
                customerId: string | null;
                duration: number | null;
                callSessionId: string;
                agentId: string | null;
                leftAt: Date | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CallStatus;
            customerId: string | null;
            conversationId: string | null;
            callerUserId: string | null;
            calleeUserId: string | null;
            startedAt: Date | null;
            endedAt: Date | null;
            duration: number | null;
            recordingUrl: string | null;
            reason: string | null;
            livekitRoom: string | null;
            transferHistory: import("@prisma/client/runtime/library").JsonValue | null;
            holdDuration: number | null;
        };
    } & {
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
    })[]>;
    getMyRingingCall(req: Request): Promise<{
        call: null;
    } | {
        call: {
            caller: string;
            phone: string;
            callSid: string | null;
            roomName: string | null;
            timestamp: number;
            source: string;
            customerContext: {
                customer: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string | null;
                    phone: string;
                    emergencyContact: string | null;
                    platform: string | null;
                    platformUserId: string | null;
                    instagramUsername: string | null;
                    instagramProfilePic: string | null;
                    profileEnriched: boolean;
                    enrichmentFailed: boolean;
                    lastProfileSync: Date | null;
                } | null;
            };
            assignedAgent: {
                id: string;
                name: string;
            };
            token: string;
        };
    }>;
    getAgentToken(body: {
        roomName: string;
        participantName: string;
    }): Promise<{
        token: string;
    }>;
    handleIncomingCall(req: Request): Promise<string>;
    handleCallStatus(req: Request): Promise<string>;
    handleAiBotWebhook(body: any): Promise<{
        success: boolean;
    }>;
}
