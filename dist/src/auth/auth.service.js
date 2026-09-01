"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const ioredis_1 = require("ioredis");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    redis;
    constructor(prisma, jwtService, redis) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.redis = redis;
    }
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user, deviceInfo, ipAddress, rememberMe = false) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            orgId: user.organizationId,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshTokenExpiresIn = rememberMe ? '30d' : '7d';
        const refreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: refreshTokenExpiresIn });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));
        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                deviceInfo: deviceInfo || 'Unknown Device',
                ipAddress: ipAddress || '127.0.0.1',
                expiresAt,
            },
        });
        await this.redis.set(`session:${session.id}`, JSON.stringify({ userId: user.id, role: user.role, active: true }), 'EX', rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600);
        await this.prisma.supervisorLog.create({
            data: {
                supervisorId: user.id,
                action: 'USER_LOGIN',
                targetId: user.id,
                details: { deviceInfo, ipAddress, rememberMe },
            },
        });
        const agentProfile = await this.prisma.agent.findUnique({
            where: { userId: user.id }
        });
        return {
            accessToken,
            refreshToken,
            session: {
                id: session.id,
                userId: user.id,
                agentId: agentProfile?.id || null,
                name: agentProfile?.name || user.email.split('@')[0],
                role: user.role,
                email: user.email,
                orgId: user.organizationId,
            },
        };
    }
    async refresh(token, deviceInfo, ipAddress) {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid token type');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const newPayload = {
                email: user.email,
                sub: user.id,
                role: user.role,
                orgId: user.organizationId,
            };
            const accessToken = this.jwtService.sign(newPayload);
            const newRefreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: '7d' });
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            const session = await this.prisma.session.create({
                data: {
                    userId: user.id,
                    deviceInfo: deviceInfo || 'Rotated Session',
                    ipAddress: ipAddress || '127.0.0.1',
                    expiresAt,
                },
            });
            await this.redis.set(`session:${session.id}`, JSON.stringify({ userId: user.id, role: user.role, active: true }), 'EX', 7 * 24 * 3600);
            return {
                accessToken,
                refreshToken: newRefreshToken,
                session: {
                    id: session.id,
                    role: user.role,
                    email: user.email,
                    orgId: user.organizationId,
                },
            };
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async register(registerDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existing) {
            throw new common_1.BadRequestException('Email is already registered');
        }
        const passwordHash = await this.hashPassword(registerDto.password);
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                passwordHash,
                organizationId: registerDto.organizationId || null,
                role: 'AGENT',
            },
        });
        await this.prisma.supervisorLog.create({
            data: {
                supervisorId: user.id,
                action: 'USER_REGISTERED',
                targetId: user.id,
                details: { email: user.email },
            },
        });
        return user;
    }
    async logout(sessionId, userId) {
        await this.redis.del(`session:${sessionId}`);
        try {
            await this.prisma.session.delete({
                where: { id: sessionId },
            });
        }
        catch (e) { }
        await this.prisma.supervisorLog.create({
            data: {
                supervisorId: userId,
                action: 'USER_LOGOUT',
                targetId: userId,
                details: { sessionId },
            },
        });
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        ioredis_1.Redis])
], AuthService);
//# sourceMappingURL=auth.service.js.map