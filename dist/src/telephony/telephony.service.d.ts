import { PrismaService } from '../prisma/prisma.service';
export declare class TelephonyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    lookupCustomerContext(phoneNumber: string): Promise<{
        customer: ({
            servicePlans: {
                id: string;
                status: string;
                createdAt: Date;
                customerId: string;
                planType: string;
                startDate: Date;
                endDate: Date | null;
            }[];
            tickets: {
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                priority: import(".prisma/client").$Enums.Priority;
                customerId: string;
                agentId: string | null;
                category: string;
                resolution: string | null;
            }[];
        } & {
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
        }) | ({
            assignedAgent: {
                name: string;
                id: string;
                phone: string | null;
                address: string | null;
                city: string | null;
                state: string | null;
                country: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                userId: string;
            } | null;
        } & {
            id: string;
            city: string | null;
            status: import(".prisma/client").$Enums.LeadStatus;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            notes: string | null;
            phoneNumber: string;
            customerName: string;
            serviceInterest: string | null;
            source: string | null;
            priority: import(".prisma/client").$Enums.LeadPriority;
            conversionScore: number | null;
            sentiment: string | null;
            uploadedById: string | null;
            assignedAgentId: string | null;
            uploadHistoryId: string | null;
            lockedAt: Date | null;
        }) | null;
        priority: any;
        servicePlans: {
            id: string;
            status: string;
            createdAt: Date;
            customerId: string;
            planType: string;
            startDate: Date;
            endDate: Date | null;
        }[];
        tickets: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            priority: import(".prisma/client").$Enums.Priority;
            customerId: string;
            agentId: string | null;
            category: string;
            resolution: string | null;
        }[];
    } | null>;
    createCallSession(callSid: string, roomName: string, customerId?: string, agentId?: string): Promise<{
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
    getMyRingingCall(agentId: string): Promise<{
        callSession: {
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
            participants: {
                id: string;
                joinedAt: Date;
                customerId: string | null;
                agentId: string | null;
                duration: number | null;
                role: string;
                leftAt: Date | null;
                callSessionId: string;
            }[];
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
        };
        agent: {
            name: string;
            id: string;
            phone: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            country: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        };
    } | null>;
    private uploadRecordingToSupabase;
    dispatchVoiceBot(roomName: string): Promise<void>;
}
