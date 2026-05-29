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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonyGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const telephony_service_1 = require("./telephony.service");
const livekit_service_1 = require("./livekit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let TelephonyGateway = class TelephonyGateway {
    telephonyService;
    livekitService;
    prisma;
    server;
    logger = new common_1.Logger('TelephonyGateway');
    constructor(telephonyService, livekitService, prisma) {
        this.telephonyService = telephonyService;
        this.livekitService = livekitService;
        this.prisma = prisma;
    }
    afterInit(server) {
        this.logger.log('Telephony WebSocket Gateway initialized');
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        try {
            const agent = await this.prisma.agent.findFirst({
                where: { socketId: client.id },
            });
            if (agent) {
                await this.prisma.agent.update({
                    where: { id: agent.id },
                    data: { status: 'OFFLINE', socketId: null },
                });
                this.logger.log(`Agent ${agent.name} marked OFFLINE on disconnect.`);
                this.server.emit('agent_status_change', {
                    agentId: agent.id,
                    status: 'OFFLINE',
                });
            }
        }
        catch (e) {
            this.logger.error(`Error handling disconnect: ${e.message}`);
        }
    }
    async handleAgentLogin(data, client) {
        const { agentId, name } = data;
        this.logger.log(`Agent ${name || agentId} logging in via WebSocket...`);
        if (agentId) {
            try {
                let agent = await this.prisma.agent.findUnique({
                    where: { id: agentId },
                });
                if (!agent) {
                    agent = await this.prisma.agent.findUnique({
                        where: { userId: agentId },
                    });
                }
                if (agent) {
                    await this.prisma.agent.update({
                        where: { id: agent.id },
                        data: {
                            status: 'AVAILABLE',
                            socketId: client.id,
                            lastActive: new Date(),
                        },
                    });
                    this.logger.log(`Agent ${agent.name} is now AVAILABLE for calls.`);
                    this.server.emit('agent_status_change', {
                        agentId: agent.id,
                        status: 'AVAILABLE',
                        name: agent.name,
                    });
                }
                else {
                    this.logger.warn(`Agent login failed: No agent found for ID ${agentId}`);
                }
            }
            catch (e) {
                this.logger.error(`Agent login error: ${e.message}`);
            }
        }
    }
    async handleStatusUpdate(data, client) {
        const { status } = data;
        try {
            const agent = await this.prisma.agent.findFirst({
                where: { socketId: client.id },
            });
            if (agent) {
                await this.prisma.agent.update({
                    where: { id: agent.id },
                    data: { status, lastActive: new Date() },
                });
                this.logger.log(`Agent ${agent.name} changed status to ${status}`);
                this.server.emit('agent_status_change', { agentId: agent.id, status });
            }
        }
        catch (e) {
            this.logger.error(`Status update error: ${e.message}`);
        }
    }
    dispatchIncomingCallToAgent(socketId, payload) {
        const paddedPayload = { ...payload, _padding: ' '.repeat(4096) };
        if (socketId) {
            this.logger.log(`Dispatching targeted incoming_call event to agent socket: ${socketId}`);
            this.server.to(socketId).emit('incoming_call', payload);
            this.server.to(socketId).emit('proxy_flush', ' '.repeat(131072));
            this.logger.log('SUCCESS: Emit executed for specific socket');
        }
        else {
            this.logger.warn(`No socketId provided for assigned agent. Fallback to global broadcast.`);
            this.server.emit('incoming_call', payload);
            this.server.emit('proxy_flush', ' '.repeat(131072));
            this.logger.log('SUCCESS: Emit executed globally');
        }
    }
    async handleAcceptCall(data, client) {
        this.logger.log(`Agent accepted call: ${data.callSid}`);
        const agentId = data.agentId || client.handshake.auth?.agentId;
        if (!agentId) {
            this.logger.error(`No agentId provided for acceptCall ${data.callSid}`);
            return;
        }
        await this.telephonyService.acceptCallSession(data.callSid, agentId);
    }
    async handleEndCall(data, client) {
        this.logger.log(`Call ended by frontend: ${data.callSid}, duration: ${data.duration}`);
        await this.telephonyService.endCallSession(data.callSid, data.duration);
    }
};
exports.TelephonyGateway = TelephonyGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TelephonyGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('agent_login'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TelephonyGateway.prototype, "handleAgentLogin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('status_update'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TelephonyGateway.prototype, "handleStatusUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('acceptCall'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TelephonyGateway.prototype, "handleAcceptCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('endCall'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TelephonyGateway.prototype, "handleEndCall", null);
exports.TelephonyGateway = TelephonyGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [telephony_service_1.TelephonyService,
        livekit_service_1.LivekitService,
        prisma_service_1.PrismaService])
], TelephonyGateway);
//# sourceMappingURL=telephony.gateway.js.map