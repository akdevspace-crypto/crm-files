import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { InstagramProfileEnrichmentService } from './instagram-enrichment.service';
import { InstagramEnrichmentProcessor } from './instagram-enrichment.processor';
import { OmnichannelController } from './omnichannel.controller';
import { VoiceAssistantService } from './voice-assistant.service';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    BullModule.registerQueue({
      name: 'instagram-enrichment',
    }),
  ],
  controllers: [OmnichannelController],
  providers: [InstagramProfileEnrichmentService, InstagramEnrichmentProcessor, VoiceAssistantService],
  exports: [InstagramProfileEnrichmentService, VoiceAssistantService],
})
export class OmnichannelModule {}
