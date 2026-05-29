import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { InstagramProfileEnrichmentService } from './instagram-enrichment.service';
import { InstagramEnrichmentProcessor } from './instagram-enrichment.processor';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    BullModule.registerQueue({
      name: 'instagram-enrichment',
    }),
  ],
  providers: [InstagramProfileEnrichmentService, InstagramEnrichmentProcessor],
  exports: [InstagramProfileEnrichmentService],
})
export class OmnichannelModule {}
