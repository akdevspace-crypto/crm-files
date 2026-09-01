import { PrismaService } from '../prisma/prisma.service';
export declare class UserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        agentProfile: {
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
        userRoles: ({
            role: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            roleId: string;
            userId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        authUserId: string | null;
        email: string;
        passwordHash: string;
        organizationId: string | null;
    })[]>;
    findById(id: string): Promise<({
        agentProfile: {
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
        userRoles: ({
            role: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            roleId: string;
            userId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        authUserId: string | null;
        email: string;
        passwordHash: string;
        organizationId: string | null;
    }) | null>;
    updateAgentProfile(userId: string, data: any): Promise<{
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
    }>;
    assignRole(userId: string, roleId: string): Promise<{
        roleId: string;
        userId: string;
    }>;
    removeRole(userId: string, roleId: string): Promise<{
        roleId: string;
        userId: string;
    }>;
    updateStatus(userId: string, isActive: boolean): Promise<{
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
    }>;
}
