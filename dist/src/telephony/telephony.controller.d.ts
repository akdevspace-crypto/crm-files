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
            status: import(".prisma/client").$Enums.CallStatus;
            createdAt: Date;
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
            status: import(".prisma/client").$Enums.CallStatus;
            createdAt: Date;
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
                    name: string;
                    id: string;
                    phone: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string | null;
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
    handleIncomingCall(req: Request): Promise<string>;
    handleCallStatus(req: Request): Promise<string>;
}
