import { Controller, Post, UseGuards, Req, Body, Get, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user with email and password' })
  @ApiResponse({ status: 200, description: 'Successful login, returns JWT tokens' })
  async login(
    @Req() req: any,
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    return this.authService.login(req.user, userAgent, ip, loginDto.rememberMe);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new CRM user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate JWT access token using refresh token' })
  async refresh(
    @Req() req: any,
    @Body('refreshToken') refreshToken: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const ip = req.ip || req.connection.remoteAddress;
    return this.authService.refresh(refreshToken, userAgent, ip);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Retrieve currently logged-in user profile context' })
  async getProfile(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate active JWT token and logout device session' })
  async logout(@Req() req: any, @Body('sessionId') sessionId: string) {
    return this.authService.logout(sessionId, req.user.id);
  }
}
