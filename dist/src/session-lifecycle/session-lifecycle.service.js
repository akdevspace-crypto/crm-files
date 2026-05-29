"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SessionLifecycleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionLifecycleService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../prisma/prisma.service");
let SessionLifecycleService = SessionLifecycleService_1 = class SessionLifecycleService {
    redis;
    prisma;
    logger = new common_1.Logger(SessionLifecycleService_1.name);
    constructor(redis, prisma) {
        this.redis = redis;
        this.prisma = prisma;
    }
    async createCallSession(agentId, customerId, queueId) {
        const session = { id: 'mock-session-id' };
        await this.redis.set(`active_session:${agentId}`, JSON.stringify({
            sessionId: session.id,
            customerId,
            timestamp: Date.now(),
        }), 'EX', 3600);
        this.logger.log(`Session created: ${session.id} for Agent: ${agentId}`);
        return session;
    }
    async recoverSession(agentId) {
        const data = await this.redis.get(`active_session:${agentId}`);
        if (data) {
            this.logger.log(`Recovered session for Agent: ${agentId}`);
            return JSON.parse(data);
        }
        return null;
    }
    async endCallSession(agentId, sessionId) {
        await this.redis.del(`active_session:${agentId}`);
        this.logger.log(`Session ended: ${sessionId}`);
    }
};
exports.SessionLifecycleService = SessionLifecycleService;
exports.SessionLifecycleService = SessionLifecycleService = SessionLifecycleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.Redis,
        prisma_service_1.PrismaService])
], SessionLifecycleService);
//# sourceMappingURL=session-lifecycle.service.js.map