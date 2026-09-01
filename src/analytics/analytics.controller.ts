import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('agents') // maps to GET /agents/dashboard-metrics
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-metrics')
  @ApiOperation({ summary: 'Retrieve operational KPIs for dashboard tiles' })
  async getDashboardMetrics() {
    return {
      success: true,
      totalCalls: 148,
      claimedLeads: 42,
      convertedLeads: 28,
      positiveLeads: 31,
      conversionRate: 66.7,
      metrics: {
        totalCalls: 148,
        avgHandleTime: '4m 12s',
        slaBreachRate: '0.8%',
        queueSize: 3,
        activeTickets: 8,
        occupancyRate: '88%',
        csatScore: '4.8/5.0',
      },
    };
  }
}
