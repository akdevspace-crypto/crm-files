import { Controller, Get, Post, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, CreateCommentDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List activities filtered by lead or customer context' })
  async getActivities(
    @Query('customerId') customerId?: string,
    @Query('leadId') leadId?: string,
  ) {
    return this.activitiesService.getActivities(customerId, leadId);
  }

  @Post()
  @ApiOperation({ summary: 'Log a new customer or lead interaction event' })
  async createActivity(@Req() req: any, @Body() dto: CreateActivityDto) {
    // Map requesting user id as agent context
    return this.activitiesService.createActivity(dto, req.user.id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a text comment to an activity record' })
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.activitiesService.addActivityComment(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an activity log entry' })
  async deleteActivity(@Param('id') id: string) {
    return this.activitiesService.deleteActivity(id);
  }
}
