import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Retrieve dynamic metrics and layouts for the specified dashboard preset' })
  async getDashboardAnalytics(
    @Query('type') type: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getDashboardAnalytics(type || 'executive', query);
  }
}
