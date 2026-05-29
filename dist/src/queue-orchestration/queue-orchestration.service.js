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
var QueueOrchestrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueOrchestrationService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
let QueueOrchestrationService = QueueOrchestrationService_1 = class QueueOrchestrationService {
    supportQueue;
    salesQueue;
    logger = new common_1.Logger(QueueOrchestrationService_1.name);
    constructor(supportQueue, salesQueue) {
        this.supportQueue = supportQueue;
        this.salesQueue = salesQueue;
    }
    async enqueueCall(callData, type) {
        this.logger.log(`Incoming call routed to ${type} queue`);
        const queue = type === 'support' ? this.supportQueue : this.salesQueue;
        await queue.add('route_call', callData, {
            priority: callData.isEmergency ? 1 : 10,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
        });
    }
    async allocateAgent(department) {
        this.logger.log(`Attempting to allocate agent for department: ${department || 'any'}`);
    }
    async getQueueMetrics() {
        const supportCount = await this.supportQueue.getWaitingCount();
        const salesCount = await this.salesQueue.getWaitingCount();
        return { supportCount, salesCount };
    }
};
exports.QueueOrchestrationService = QueueOrchestrationService;
exports.QueueOrchestrationService = QueueOrchestrationService = QueueOrchestrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_2.InjectQueue)('support_queue')),
    __param(1, (0, bullmq_2.InjectQueue)('sales_queue')),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        bullmq_1.Queue])
], QueueOrchestrationService);
//# sourceMappingURL=queue-orchestration.service.js.map