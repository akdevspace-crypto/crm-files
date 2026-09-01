import { Controller, Post, Get, Put, Body, Param, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';

@Controller('v1/approvals')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  async createRequest(
    @Req() req: any,
    @Body('type') type: string,
    @Body('details') details: any
  ) {
    return this.approvalsService.createRequest(req.user.id, type, details);
  }

  @Get()
  async getRequests(@Query('status') status?: string, @Query('requesterId') requesterId?: string) {
    return this.approvalsService.getRequests(status, requesterId);
  }

  @Put(':id/review')
  async reviewRequest(
    @Param('id') id: string,
    @Req() req: any,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @Body('notes') notes: string
  ) {
    const allowedRoles = ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ForbiddenException('Insufficient role permissions');
    }
    return this.approvalsService.reviewRequest(id, req.user.id, status, notes);
  }
}
