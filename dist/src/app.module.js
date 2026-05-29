"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
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
                connection: getRedisConnectionOptions(),
            }),
            api_gateway_module_1.ApiGatewayModule,
            agent_module_1.AgentModule,
            queue_orchestration_module_1.QueueOrchestrationModule,
            telephony_module_1.TelephonyModule,
            session_lifecycle_module_1.SessionLifecycleModule,
            omnichannel_module_1.OmnichannelModule,
            analytics_module_1.AnalyticsModule,
            recording_module_1.RecordingModule,
            notification_module_1.NotificationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map