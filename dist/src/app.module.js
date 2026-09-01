"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const api_gateway_module_1 = require("./api-gateway/api-gateway.module");
const agent_module_1 = require("./agent/agent.module");
const queue_orchestration_module_1 = require("./queue-orchestration/queue-orchestration.module");
const telephony_module_1 = require("./telephony/telephony.module");
const session_lifecycle_module_1 = require("./session-lifecycle/session-lifecycle.module");
const omnichannel_module_1 = require("./omnichannel/omnichannel.module");
const analytics_module_1 = require("./analytics/analytics.module");
const recording_module_1 = require("./recording/recording.module");
const notification_module_1 = require("./notification/notification.module");
const auth_module_1 = require("./auth/auth.module");
const org_module_1 = require("./org/org.module");
const user_module_1 = require("./user/user.module");
const leads_module_1 = require("./leads/leads.module");
const activities_module_1 = require("./activities/activities.module");
const calendar_module_1 = require("./calendar/calendar.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const timeline_module_1 = require("./timeline/timeline.module");
const websockets_module_1 = require("./websockets/websockets.module");
const automation_module_1 = require("./automation/automation.module");
const customers_module_1 = require("./customers/customers.module");
const emergency_module_1 = require("./emergency/emergency.module");
const approvals_module_1 = require("./approvals/approvals.module");
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
    }
    catch (err) {
        return {
            host: 'localhost',
            port: 6379,
            maxRetriesPerRequest: null,
        };
    }
};
const sharedRedisConnection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            bullmq_1.BullModule.forRoot({
                connection: sharedRedisConnection,
            }),
            api_gateway_module_1.ApiGatewayModule,
            agent_module_1.AgentModule,
            queue_orchestration_module_1.QueueOrchestrationModule,
            telephony_module_1.TelephonyModule,
            websockets_module_1.WebsocketsModule,
            session_lifecycle_module_1.SessionLifecycleModule,
            omnichannel_module_1.OmnichannelModule,
            analytics_module_1.AnalyticsModule,
            recording_module_1.RecordingModule,
            notification_module_1.NotificationModule,
            auth_module_1.AuthModule,
            org_module_1.OrgModule,
            user_module_1.UserModule,
            leads_module_1.LeadsModule,
            activities_module_1.ActivitiesModule,
            calendar_module_1.CalendarModule,
            dashboard_module_1.DashboardModule,
            timeline_module_1.TimelineModule,
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot(),
            automation_module_1.AutomationModule,
            customers_module_1.CustomersModule,
            emergency_module_1.EmergencyModule,
            approvals_module_1.ApprovalsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map