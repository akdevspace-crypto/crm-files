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
var ApiGatewayController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayController = void 0;
const common_1 = require("@nestjs/common");
const queue_orchestration_service_1 = require("../queue-orchestration/queue-orchestration.service");
let ApiGatewayController = ApiGatewayController_1 = class ApiGatewayController {
    queueOrchestrationService;
    logger = new common_1.Logger(ApiGatewayController_1.name);
    constructor(queueOrchestrationService) {
        this.queueOrchestrationService = queueOrchestrationService;
    }
    healthCheck() {
        return { status: 'OK', timestamp: new Date().toISOString() };
    }
    async handleInboundCallFromIVR(payload) {
        this.logger.log(`Received inbound call from IVR for customer: ${payload.customerId}`);
        const queueType = payload.department === 'sales' ? 'sales' : 'support';
        await this.queueOrchestrationService.enqueueCall(payload, queueType);
        return {
            status: 'QUEUED',
            message: `Call routed to ${queueType} queue successfully.`,
        };
    }
};
exports.ApiGatewayController = ApiGatewayController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiGatewayController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('ivr/webhook/inbound'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "handleInboundCallFromIVR", null);
exports.ApiGatewayController = ApiGatewayController = ApiGatewayController_1 = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [queue_orchestration_service_1.QueueOrchestrationService])
], ApiGatewayController);
//# sourceMappingURL=api-gateway.controller.js.map