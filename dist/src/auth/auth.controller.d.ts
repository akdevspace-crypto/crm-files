import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any, loginDto: LoginDto, userAgent: string): Promise<{
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
    refresh(req: any, refreshToken: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
        session: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            orgId: string | null;
        };
    }>;
    getProfile(req: any): Promise<any>;
    logout(req: any, sessionId: string): Promise<{
        success: boolean;
    }>;
}
