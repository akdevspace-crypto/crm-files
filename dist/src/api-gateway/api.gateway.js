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
var ApiGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agent/agent.service");
let ApiGateway = ApiGateway_1 = class ApiGateway {
    agentService;
    server;
    logger = new common_1.Logger(ApiGateway_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    async handleConnection(client) {
        const authToken = client.handshake.auth.token;
        this.logger.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleAgentStatusChange(client, payload) {
        await this.agentService.updateAgentStatus(payload.agentId, payload.status);
        return { event: 'status_updated', data: payload.status };
    }
    handleSdpOffer(client, payload) {
        this.server.to(payload.targetId).emit('sdp_offer', payload.sdp);
    }
    handleIceCandidate(client, payload) {
        this.server.to(payload.targetId).emit('ice_candidate', payload.candidate);
    }
};
exports.ApiGateway = ApiGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ApiGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('agent_status_change'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ApiGateway.prototype, "handleAgentStatusChange", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sdp_offer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ApiGateway.prototype, "handleSdpOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ice_candidate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ApiGateway.prototype, "handleIceCandidate", null);
exports.ApiGateway = ApiGateway = ApiGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], ApiGateway);
//# sourceMappingURL=api.gateway.js.map