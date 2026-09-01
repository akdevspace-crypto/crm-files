import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CalendarRepository } from './calendar.repository';
import { CalendarCronService } from './calendar.cron';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CalendarController],
  providers: [CalendarService, CalendarRepository, CalendarCronService],
  exports: [CalendarService],
})
export class CalendarModule {}
