import { PrismaService } from '../prisma/prisma.service';
export declare class ApprovalsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createRequest(requesterId: string, type: string, details: any): Promise<{
        message: string;
        request: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            type: string;
            notes: string | null;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            resolvedAt: Date | null;
            requesterId: string;
            approverId: string | null;
        };
    }>;
    getRequests(status?: string, requesterId?: string): Promise<({
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            agentProfile: {
                name: string;
            } | null;
        };
        approver: {
            id: string;
            email: string;
            agentProfile: {
                name: string;
            } | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        notes: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        resolvedAt: Date | null;
        requesterId: string;
        approverId: string | null;
    })[]>;
    reviewRequest(id: string, approverId: string, status: 'APPROVED' | 'REJECTED', notes: string): Promise<{
        message: string;
        updatedRequest: {
            requester: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            type: string;
            notes: string | null;
            details: import("@prisma/client/runtime/library").JsonValue | null;
            resolvedAt: Date | null;
            requesterId: string;
            approverId: string | null;
        };
    }>;
}
