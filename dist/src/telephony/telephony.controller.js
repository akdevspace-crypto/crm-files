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
var TelephonyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonyController = void 0;
const common_1 = require("@nestjs/common");
const livekit_service_1 = require("./livekit.service");
const telephony_service_1 = require("./telephony.service");
const telephony_gateway_1 = require("./telephony.gateway");
const queue_service_1 = require("../queue-orchestration/queue.service");
let TelephonyController = TelephonyController_1 = class TelephonyController {
    livekitService;
    telephonyService;
    telephonyGateway;
    queueService;
    logger = new common_1.Logger(TelephonyController_1.name);
    constructor(livekitService, telephonyService, telephonyGateway, queueService) {
        this.livekitService = livekitService;
        this.telephonyService = telephonyService;
        this.telephonyGateway = telephonyGateway;
        this.queueService = queueService;
    }
    async getDashboardCalls() {
        return await this.telephonyService.getDashboardCalls();
    }
    async getMyRingingCall(req) {
        const agentId = req.query.agentId;
        if (!agentId)
            return { call: null };
        const result = await this.telephonyService.getMyRingingCall(agentId);
        if (!result)
            return { call: null };
        const { callSession, agent } = result;
        const token = await this.livekitService.generateAgentToken(callSession.livekitRoom || `room_${Date.now()}`, agent.name || 'Agent');
        return {
            call: {
                caller: callSession.customer?.phone || 'Unknown',
                phone: callSession.customer?.phone || 'Unknown',
                callSid: callSession.reason,
                roomName: callSession.livekitRoom,
                timestamp: callSession.createdAt.getTime(),
                source: 'exotel',
                customerContext: { customer: callSession.customer },
                assignedAgent: { id: agent.id, name: agent.name },
                token,
            },
        };
    }
    async handleIncomingCall(req) {
        this.logger.log(`Received incoming call webhook from Exotel via ${req.method}`);
        const payload = req.method === 'POST' ? req.body : req.query;
        this.logger.debug(`Webhook Payload: ${JSON.stringify(payload)}`);
        const callerNumber = payload?.From || payload?.CallFrom || 'Unknown';
        const callSid = payload?.CallSid || req.query.CallSid || `sid_${Date.now()}`;
        const roomName = payload?.roomName || req.query.roomName || `call_${Date.now()}`;
        const livekitSipDomain = '4c0ct02u07s.sip.livekit.cloud';
        const forwardedHost = req.headers['x-forwarded-host'];
        const host = Array.isArray(forwardedHost) ? forwardedHost[0] : (forwardedHost || req.get('host'));
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const baseUrl = `${protocol}://${host}`;
        const isPoll = req.query.poll === 'true';
        try {
            if (!isPoll) {
                const [assignedAgent, customerContext] = await Promise.all([
                    this.queueService.allocateAgent(),
                    this.telephonyService.lookupCustomerContext(callerNumber),
                ]);
                if (!assignedAgent) {
                    this.logger.warn(`No agents available for call ${callSid} from ${callerNumber}`);
                    return `
<Response>
    <Say voice="woman">
        Welcome to Universal Elder Care.
        All our agents are currently busy. Please try again later or leave a message.
    </Say>
</Response>`.trim();
                }
                this.telephonyService
                    .createCallSession(callSid, roomName, customerContext?.customer?.id, assignedAgent.userId)
                    .catch((e) => this.logger.error(`Background session creation failed: ${e.message}`));
                const token = await this.livekitService.generateAgentToken(roomName, assignedAgent.name || 'Agent');
                this.telephonyGateway.dispatchIncomingCallToAgent(assignedAgent.socketId, {
                    caller: callerNumber,
                    phone: callerNumber,
                    callSid,
                    roomName,
                    timestamp: Date.now(),
                    source: 'exotel',
                    customerContext,
                    assignedAgent: {
                        id: assignedAgent.id,
                        name: assignedAgent.name,
                    },
                    token,
                });
            }
            this.logger.log(`Bridging Exotel call directly to LiveKit SIP trunk...`);
            const twimlResponse = `
<Response>
    <Dial action="${baseUrl}/exotel/status">
        <Number>sip:${roomName}@${livekitSipDomain}</Number>
    </Dial>
</Response>`.trim();
            this.logger.log(`[DEBUG] Returning TwiML to Provider: \n${twimlResponse}`);
            return twimlResponse;
        }
        catch (error) {
            this.logger.error(`Error processing incoming call: ${error.message}`, error.stack);
            return `
<Response>
    <Say voice="woman">
        We are sorry, our systems are currently unavailable. Please try again later.
    </Say>
</Response>`.trim();
        }
    }
    async handleCallStatus(req) {
        const payload = req.method === 'POST' ? req.body : req.query;
        this.logger.log(`\n\n=== [DEBUG] EXOTEL STATUS WEBHOOK RECEIVED ===`);
        this.logger.log(`FULL PAYLOAD: ${JSON.stringify(payload)}`);
        const callSid = payload?.CallSid;
        const status = payload?.DialCallStatus || payload?.CallStatus || payload?.Status || '';
        const duration = parseInt(payload?.DialCallDuration || '0', 10);
        const recordingUrl = payload?.RecordingUrl || null;
        const sipResponseCode = payload?.SipResponseCode || null;
        const errorCode = payload?.ErrorCode || payload?.DialCallErrorCode || null;
        const errorMessage = payload?.ErrorMessage || payload?.DialCallErrorMessage || null;
        this.logger.log(`CallSid: ${callSid}`);
        this.logger.log(`General Status: ${status.toUpperCase()}`);
        this.logger.log(`Duration: ${duration}s`);
        if (payload?.DialCallStatus) {
            this.logger.log(`DialCallStatus: ${payload.DialCallStatus}`);
            if (payload.DialCallStatus.toLowerCase() === 'failed') {
                this.logger.error(`🚨 SIP DIAL FAILED! SIP Response Code: ${sipResponseCode}, Error Code: ${errorCode}, Error Msg: ${errorMessage}`);
            }
        }
        if (errorCode || errorMessage) {
            this.logger.error(`🚨 PROVIDER ERROR: Code=${errorCode}, Msg=${errorMessage}`);
        }
        this.logger.log(`====================================================\n\n`);
        if (callSid && ['completed', 'canceled', 'failed', 'busy', 'no-answer'].includes(status.toLowerCase())) {
            await this.telephonyService.endCallSession(callSid, duration, recordingUrl);
            this.logger.log(`Emitting callEnded for ${callSid} to frontend.`);
            this.telephonyGateway.server.emit('callEnded', { callSid });
        }
        return 'OK';
    }
};
exports.TelephonyController = TelephonyController;
__decorate([
    (0, common_1.Get)('dashboard-calls'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelephonyController.prototype, "getDashboardCalls", null);
__decorate([
    (0, common_1.Get)('my-ringing-call'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelephonyController.prototype, "getMyRingingCall", null);
__decorate([
    (0, common_1.All)('incoming'),
    (0, common_1.Header)('Content-Type', 'text/xml'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelephonyController.prototype, "handleIncomingCall", null);
__decorate([
    (0, common_1.All)('status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelephonyController.prototype, "handleCallStatus", null);
exports.TelephonyController = TelephonyController = TelephonyController_1 = __decorate([
    (0, common_1.Controller)('exotel'),
    __metadata("design:paramtypes", [livekit_service_1.LivekitService,
        telephony_service_1.TelephonyService,
        telephony_gateway_1.TelephonyGateway,
        queue_service_1.QueueService])
], TelephonyController);
//# sourceMappingURL=telephony.controller.js.map