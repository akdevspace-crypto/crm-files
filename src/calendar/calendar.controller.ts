import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateEventDto, UpdateEventDto } from './dto/calendar.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'List calendar events' })
  async getEvents(@Req() req: any) {
    return this.calendarService.getAgentEvents(req.user.id, req.user.role);
  }

  @Post()
  @ApiOperation({ summary: 'Schedule a new calendar appointment event' })
  async createEvent(@Req() req: any, @Body() dto: CreateEventDto) {
    return this.calendarService.createEvent(req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update scheduled calendar appointment' })
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.calendarService.updateEvent(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel calendar appointment event' })
  async deleteEvent(@Param('id') id: string) {
    return this.calendarService.deleteEvent(id);
  }
}
