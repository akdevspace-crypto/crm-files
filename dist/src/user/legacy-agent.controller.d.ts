import { PrismaService } from '../prisma/prisma.service';
export declare class LegacyAgentController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAgents(): Promise<{
        success: boolean;
        agents: {
            id: string;
            name: string;
            employeeId: string | null;
            department: string;
            status: import(".prisma/client").$Enums.AgentStatus;
            user: {
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        }[];
    }>;
    createAgent(body: any): Promise<{
        success: boolean;
        agent: {
            id: string;
            name: string;
            user: {
                email: string;
            };
        };
    }>;
    updateAgent(id: string, body: any): Promise<{
        success: boolean;
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
    }>;
    deleteAgent(id: string): Promise<{
        success: boolean;
    }>;
}
