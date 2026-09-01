import { Module } from '@nestjs/common';
import { TelephonyService } from './telephony.service';
import { LivekitService } from './livekit.service';
import { TelephonyGateway } from './telephony.gateway';
import { TelephonyController } from './telephony.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueOrchestrationModule } from '../queue-orchestration/queue-orchestration.module';
import { TimelineModule } from '../timeline/timeline.module';
import { AiSpeechService } from './ai-speech.service';

@Module({
  imports: [PrismaModule, QueueOrchestrationModule, TimelineModule],
  controllers: [TelephonyController],
  providers: [TelephonyService, LivekitService, TelephonyGateway, AiSpeechService],
  exports: [TelephonyService, LivekitService, AiSpeechService],
})
export class TelephonyModule {}
