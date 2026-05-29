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
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let AgentService = AgentService_1 = class AgentService {
    redis;
    logger = new common_1.Logger(AgentService_1.name);
    constructor(redis) {
        this.redis = redis;
    }
    async updateAgentStatus(agentId, status) {
        const key = `agent_status:${agentId}`;
        await this.redis.hset(key, {
            status,
            updatedAt: Date.now(),
        });
        this.logger.log(`Agent ${agentId} status updated to ${status}`);
        await this.redis.publish('agent_events', JSON.stringify({ type: 'STATUS_UPDATE', agentId, status }));
    }
    async getAvailableAgentsBySkill(skill) {
        const keys = await this.redis.keys('agent_status:*');
        const availableAgents = [];
        for (const key of keys) {
            const data = await this.redis.hgetall(key);
            if (data.status === 'AVAILABLE') {
                const agentId = key.split(':')[1];
                availableAgents.push({
                    id: agentId,
                    lastActive: parseInt(data.updatedAt),
                });
            }
        }
        return availableAgents;
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.Redis])
], AgentService);
//# sourceMappingURL=agent.service.js.map