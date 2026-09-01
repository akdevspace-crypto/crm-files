import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { AiSpeechService } from './ai-speech.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class TelephonyService {
    private readonly prisma;
    private readonly timelineService;
    private readonly aiSpeechService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, timelineService: TimelineService, aiSpeechService: AiSpeechService, eventEmitter: EventEmitter2);
    lookupCustomerContext(phoneNumber: string): Promise<{
        customer: ({
            servicePlans: {
                id: string;
                createdAt: Date;
                status: string;
                customerId: string;
                planType: string;
                startDate: Date;
                endDate: Date | null;
            }[];
            tickets: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                category: string;
                status: string;
                customerId: string;
                agentId: string | null;
                priority: import(".prisma/client").$Enums.Priority;
                resolution: string | null;
            }[];
        } & {
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
        }) | ({
            assignedAgent: {
                id: string;
                name: string;
                address: string | null;
                city: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                state: string | null;
                zipCode: string | null;
                gender: string | null;
                dob: Date | null;
                employeeId: string | null;
                department: string | null;
                avatarUrl: string | null;
                status: import(".prisma/client").$Enums.AgentStatus;
                socketId: string | null;
                lastActive: Date | null;
                joinedAt: Date;
                isDeleted: boolean;
                activeCalls: number;
                lastAssignedAt: Date | null;
                extension: string | null;
                skills: string[];
                userId: string;
            } | null;
        } & {
            id: string;
            city: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            status: import(".prisma/client").$Enums.LeadStatus;
            source: string | null;
            sentiment: string | null;
            notes: string | null;
            phoneNumber: string;
            customerName: string;
            serviceInterest: string | null;
            priority: import(".prisma/client").$Enums.LeadPriority;
            conversionScore: number | null;
            uploadedById: string | null;
            assignedAgentId: string | null;
            uploadHistoryId: string | null;
            lockedAt: Date | null;
        }) | null;
        priority: any;
        servicePlans: {
            id: string;
            createdAt: Date;
            status: string;
            customerId: string;
            planType: string;
            startDate: Date;
            endDate: Date | null;
        }[];
        tickets: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            status: string;
            customerId: string;
            agentId: string | null;
            priority: import(".prisma/client").$Enums.Priority;
            resolution: string | null;
        }[];
    } | null>;
    createCallSession(callSid: string, roomName: string, customerId?: string, agentId?: string): Promise<{
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
    } | undefined>;
    acceptCallSession(callSid: string, userIdOrAgentId: string): Promise<void>;
    endCallSession(callSid: string, duration?: number, exotelRecordingUrl?: string | null): Promise<void>;
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
    getMyRingingCall(agentId: string): Promise<{
        callSession: {
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
        agent: {
            id: string;
            name: string;
            address: string | null;
            city: string | null;
            country: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            state: string | null;
            zipCode: string | null;
            gender: string | null;
            dob: Date | null;
            employeeId: string | null;
            department: string | null;
            avatarUrl: string | null;
            status: import(".prisma/client").$Enums.AgentStatus;
            socketId: string | null;
            lastActive: Date | null;
            joinedAt: Date;
            isDeleted: boolean;
            activeCalls: number;
            lastAssignedAt: Date | null;
            extension: string | null;
            skills: string[];
            userId: string;
        };
    } | null>;
    private uploadRecordingToSupabase;
    dispatchVoiceBot(roomName: string): Promise<void>;
    handleOutboundCallRequest(lead: any): Promise<void>;
    triggerAiCallBot(lead: any): Promise<void>;
    getGenericAgent(): Promise<{
        id: string;
        name: string;
        address: string | null;
        city: string | null;
        country: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        state: string | null;
        zipCode: string | null;
        gender: string | null;
        dob: Date | null;
        employeeId: string | null;
        department: string | null;
        avatarUrl: string | null;
        status: import(".prisma/client").$Enums.AgentStatus;
        socketId: string | null;
        lastActive: Date | null;
        joinedAt: Date;
        isDeleted: boolean;
        activeCalls: number;
        lastAssignedAt: Date | null;
        extension: string | null;
        skills: string[];
        userId: string;
    } | null>;
    saveAiBotResults(leadId: string, botData: any, agentId: string): Promise<void>;
}
