import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from 'ioredis';
import { RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly redis;
    constructor(prisma: PrismaService, jwtService: JwtService, redis: Redis);
    hashPassword(password: string): Promise<string>;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any, deviceInfo?: string, ipAddress?: string, rememberMe?: boolean): Promise<{
        accessToken: string;
        refreshToken: string;
        session: {
            id: string;
            userId: any;
            agentId: string | null;
            name: any;
            role: any;
            email: any;
            orgId: any;
        };
    }>;
    refresh(token: string, deviceInfo?: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        session: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            orgId: string | null;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        authUserId: string | null;
        email: string;
        passwordHash: string;
        organizationId: string | null;
    }>;
    logout(sessionId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
