import { Module } from '@nestjs/common';
import { TelephonyService } from './telephony.service';
import { LivekitService } from './livekit.service';
import { TelephonyGateway } from './telephony.gateway';
import { TelephonyController } from './telephony.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueOrchestrationModule } from '../queue-orchestration/queue-orchestration.module';

@Module({
  imports: [PrismaModule, QueueOrchestrationModule],
  controllers: [TelephonyController],
  providers: [TelephonyService, LivekitService, TelephonyGateway],
  exports: [TelephonyService, LivekitService],
})
export class TelephonyModule {}
