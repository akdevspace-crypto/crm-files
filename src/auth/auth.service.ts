import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Validate local user login credentials
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  // Handle Login & create JWT session
  async login(user: any, deviceInfo?: string, ipAddress?: string, rememberMe = false) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      orgId: user.organizationId,
    };

    // Generate JWT Access Token
    const accessToken = this.jwtService.sign(payload);

    // Refresh Token Duration (longer if remember me)
    const refreshTokenExpiresIn = rememberMe ? '30d' : '7d';
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: refreshTokenExpiresIn },
    );

    // Dynamic session storage in PostgreSQL
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

    // Cache active session in Redis for instant authentication recovery
    await this.redis.set(
      `session:${session.id}`,
      JSON.stringify({ userId: user.id, role: user.role, active: true }),
      'EX',
      rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600,
    );

    // Log Activity log
    await this.prisma.supervisorLog.create({
      data: {
        supervisorId: user.id,
        action: 'USER_LOGIN',
        targetId: user.id,
        details: { deviceInfo, ipAddress, rememberMe },
      },
    });

    // Fetch Agent Profile if exists
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

  // Refresh Token Validation and Rotation
  async refresh(token: string, deviceInfo?: string, ipAddress?: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate rotated token pair
      const newPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        orgId: user.organizationId,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // Create new session log
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

      await this.redis.set(
        `session:${session.id}`,
        JSON.stringify({ userId: user.id, role: user.role, active: true }),
        'EX',
        7 * 24 * 3600,
      );

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
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Register user
  async register(registerDto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await this.hashPassword(registerDto.password);

    // Create User, default Role Assignment as AGENT or dynamic role mapping
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        organizationId: registerDto.organizationId || null,
        role: 'AGENT', // default enum role
      },
    });

    // Log user creation
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

  // Logout & Revoke Session
  async logout(sessionId: string, userId: string) {
    await this.redis.del(`session:${sessionId}`);
    
    try {
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
    } catch (e) {}

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
}
