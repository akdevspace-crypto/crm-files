import { UserService } from './user.service';
import { UpdateUserDto, AssignRoleDto, UserStatusDto } from './dto/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    listUsers(): Promise<({
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
    getProfile(id: string): Promise<{
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
    }>;
    updateProfile(id: string, dto: UpdateUserDto): Promise<{
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
    assignRole(id: string, dto: AssignRoleDto): Promise<{
        roleId: string;
        userId: string;
    }>;
    revokeRole(id: string, roleId: string): Promise<{
        roleId: string;
        userId: string;
    }>;
    toggleStatus(id: string, dto: UserStatusDto): Promise<{
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
