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
var SupportQueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportQueueProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agent/agent.service");
let SupportQueueProcessor = SupportQueueProcessor_1 = class SupportQueueProcessor extends bullmq_1.WorkerHost {
    agentService;
    logger = new common_1.Logger(SupportQueueProcessor_1.name);
    constructor(agentService) {
        super();
        this.agentService = agentService;
    }
    async process(job) {
        this.logger.log(`Processing call ${job.id} from support queue...`);
        const availableAgents = await this.agentService.getAvailableAgentsBySkill('support');
        if (availableAgents.length === 0) {
            this.logger.warn(`No available agents for call ${job.id}. Re-queueing...`);
            throw new Error('No agents available - trigger backoff');
        }
        const selectedAgent = availableAgents.sort((a, b) => a.lastActive - b.lastActive)[0];
        await this.agentService.updateAgentStatus(selectedAgent.id, 'BUSY');
        return { assignedAgentId: selectedAgent.id, callData: job.data };
    }
};
exports.SupportQueueProcessor = SupportQueueProcessor;
exports.SupportQueueProcessor = SupportQueueProcessor = SupportQueueProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('support_queue'),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], SupportQueueProcessor);
//# sourceMappingURL=queue.processor.js.map