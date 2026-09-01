import { Controller, Post, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';

@Controller('v1/emergency')
@UseGuards(JwtAuthGuard, RbacGuard)
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('dispatch')
  async dispatchAlert(
    @Body('type') type: string,
    @Body('description') description: string,
    @Req() req: any,
  ) {
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'EMERGENCY_TEAM', 'SUPERVISOR'];
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ForbiddenException('Insufficient role permissions');
    }
    return this.emergencyService.dispatchAlert(type, description);
  }
}
