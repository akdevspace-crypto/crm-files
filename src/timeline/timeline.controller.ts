import { Controller, Get, Param, Query } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get(':id')
  async getTimeline(
    @Param('id') id: string,
    @Query('type') type: 'lead' | 'customer' = 'lead',
  ) {
    return this.timelineService.getTimeline(id, type);
  }
}
