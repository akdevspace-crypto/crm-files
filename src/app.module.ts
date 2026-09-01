import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';
import { AgentModule } from './agent/agent.module';
import { QueueOrchestrationModule } from './queue-orchestration/queue-orchestration.module';
import { TelephonyModule } from './telephony/telephony.module';
import { SessionLifecycleModule } from './session-lifecycle/session-lifecycle.module';
import { OmnichannelModule } from './omnichannel/omnichannel.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RecordingModule } from './recording/recording.module';
import { NotificationModule } from './notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { OrgModule } from './org/org.module';
import { UserModule } from './user/user.module';
import { LeadsModule } from './leads/leads.module';
import { ActivitiesModule } from './activities/activities.module';
import { CalendarModule } from './calendar/calendar.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TimelineModule } from './timeline/timeline.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { AutomationModule } from './automation/automation.module';
import { CustomersModule } from './customers/customers.module';
import { EmergencyModule } from './emergency/emergency.module';
import { ApprovalsModule } from './approvals/approvals.module';

const getRedisConnectionOptions = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    const parsed = new URL(redisUrl);
    return {
      host: parsed.hostname || 'localhost',
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      db: parsed.pathname ? parseInt(parsed.pathname.substring(1), 10) || 0 : 0,
      maxRetriesPerRequest: null,
    };
  } catch (err) {
    return {
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
};

const sharedRedisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    BullModule.forRoot({
      connection: sharedRedisConnection,
    }),
    ApiGatewayModule,
    AgentModule,
    QueueOrchestrationModule,
    TelephonyModule,
    WebsocketsModule,
    SessionLifecycleModule,
    OmnichannelModule,
    AnalyticsModule,
    RecordingModule,
    NotificationModule,
    AuthModule,
    OrgModule,
    UserModule,
    LeadsModule,
    ActivitiesModule,
    CalendarModule,
    DashboardModule,
    TimelineModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AutomationModule,
    CustomersModule,
    EmergencyModule,
    ApprovalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
