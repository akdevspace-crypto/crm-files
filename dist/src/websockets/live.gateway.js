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
var LiveGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let LiveGateway = LiveGateway_1 = class LiveGateway {
    server;
    logger = new common_1.Logger(LiveGateway_1.name);
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinLeadRoom(leadId, client) {
        client.join(`lead_${leadId}`);
        this.logger.log(`Client ${client.id} joined room lead_${leadId}`);
        return { event: 'joinedRoom', data: `lead_${leadId}` };
    }
    handleLeaveLeadRoom(leadId, client) {
        client.leave(`lead_${leadId}`);
        this.logger.log(`Client ${client.id} left room lead_${leadId}`);
        return { event: 'leftRoom', data: `lead_${leadId}` };
    }
    broadcastLeadEvent(leadId, event, data) {
        this.server.to(`lead_${leadId}`).emit(event, data);
    }
};
exports.LiveGateway = LiveGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LiveGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinLeadRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], LiveGateway.prototype, "handleJoinLeadRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveLeadRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], LiveGateway.prototype, "handleLeaveLeadRoom", null);
exports.LiveGateway = LiveGateway = LiveGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } })
], LiveGateway);
//# sourceMappingURL=live.gateway.js.map