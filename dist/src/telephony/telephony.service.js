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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TelephonyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const supabase_js_1 = require("@supabase/supabase-js");
const node_fetch_1 = __importDefault(require("node-fetch"));
let TelephonyService = TelephonyService_1 = class TelephonyService {
    prisma;
    logger = new common_1.Logger(TelephonyService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async lookupCustomerContext(phoneNumber) {
        this.logger.log(`Looking up customer context for phone: ${phoneNumber}`);
        try {
            const customer = await this.prisma.customer.findUnique({
                where: { phone: phoneNumber },
                include: { servicePlans: true, tickets: true },
            });
            const lead = await this.prisma.lead.findUnique({
                where: { phoneNumber },
                include: { assignedAgent: true },
            });
            return {
                customer: customer || lead || null,
                priority: customer ? customer.priority || 'Normal' : 'Normal',
                servicePlans: customer?.servicePlans || [],
                tickets: customer?.tickets || [],
            };
        }
        catch (error) {
            this.logger.error(`Error looking up customer context: ${error.message}`, error.stack);
            return null;
        }
    }
    async createCallSession(callSid, roomName, customerId, agentId) {
        this.logger.log(`Creating CallSession for ${callSid} in room ${roomName}`);
        try {
            return await this.prisma.callSession.create({
                data: {
                    reason: callSid,
                    customerId,
                    calleeUserId: agentId,
                    status: 'RINGING',
                    startedAt: new Date(),
                    livekitRoom: roomName,
                    participants: {
                        create: [],
                    },
                },
            });
        }
        catch (e) {
            this.logger.error(`Failed to create CallSession: ${e.message}`);
        }
    }
    async acceptCallSession(callSid, userIdOrAgentId) {
        this.logger.log(`Agent ${userIdOrAgentId} accepted CallSession ${callSid}`);
        try {
            const session = await this.prisma.callSession.findFirst({
                where: { reason: callSid },
            });
            if (!session)
                return;
            let agent = await this.prisma.agent.findFirst({
                where: { userId: userIdOrAgentId },
            });
            if (!agent) {
                agent = await this.prisma.agent.findUnique({
                    where: { id: userIdOrAgentId },
                });
            }
            const realAgentId = agent ? agent.id : userIdOrAgentId;
            await this.prisma.callSession.update({
                where: { id: session.id },
                data: {
                    status: 'IN_PROGRESS',
                },
            });
            await this.prisma.callParticipant.create({
                data: {
                    callSessionId: session.id,
                    agentId: realAgentId,
                    role: 'AGENT',
                    joinedAt: new Date(),
                },
            });
        }
        catch (e) {
            this.logger.error(`Failed to accept CallSession: ${e.message}`);
        }
    }
    async endCallSession(callSid, duration = 0, exotelRecordingUrl = null) {
        this.logger.log(`Ending CallSession ${callSid}`);
        try {
            const session = await this.prisma.callSession.findFirst({
                where: { reason: callSid },
                include: { participants: true },
            });
            if (!session)
                return;
            let finalRecordingUrl = null;
            if (exotelRecordingUrl) {
                finalRecordingUrl = await this.uploadRecordingToSupabase(exotelRecordingUrl, callSid);
            }
            await this.prisma.callSession.update({
                where: { id: session.id },
                data: {
                    endedAt: new Date(),
                    duration: duration,
                    recordingUrl: finalRecordingUrl || undefined,
                    status: duration === 0 && session.status === 'RINGING' ? 'MISSED' : 'ENDED',
                },
            });
            const agentParticipant = session.participants.find((p) => p.role === 'AGENT' && p.agentId);
            if (agentParticipant && agentParticipant.agentId) {
                await this.prisma.agent.update({
                    where: { id: agentParticipant.agentId },
                    data: { status: 'AVAILABLE', activeCalls: 0 },
                });
                await this.prisma.callParticipant.update({
                    where: { id: agentParticipant.id },
                    data: { leftAt: new Date() },
                });
            }
            else if (session.calleeUserId) {
                await this.prisma.agent.updateMany({
                    where: { userId: session.calleeUserId },
                    data: { status: 'AVAILABLE', activeCalls: 0 },
                });
            }
        }
        catch (e) {
            this.logger.error(`Failed to end CallSession: ${e.message}`);
        }
    }
    async getDashboardCalls() {
        const queuedCalls = await this.prisma.callSession.findMany({
            where: { status: 'RINGING' },
            orderBy: { startedAt: 'desc' },
            take: 5,
            include: {
                customer: { select: { name: true, phone: true } },
            },
        });
        const missedCalls = await this.prisma.callSession.findMany({
            where: { status: { in: ['MISSED', 'REJECTED'] } },
            orderBy: { startedAt: 'desc' },
            take: 5,
            include: {
                customer: { select: { name: true, phone: true } },
            },
        });
        return { queuedCalls, missedCalls };
    }
    async getMyRingingCall(agentId) {
        if (!agentId)
            return null;
        const callSession = await this.prisma.callSession.findFirst({
            where: {
                status: 'RINGING',
                participants: {
                    some: { agentId: agentId, role: 'AGENT' },
                },
            },
            include: { customer: true, participants: true },
        });
        if (!callSession)
            return null;
        const agent = await this.prisma.agent.findUnique({
            where: { userId: agentId },
        });
        if (!agent)
            return null;
        const { LivekitService } = require('./livekit.service');
        return { callSession, agent };
    }
    async uploadRecordingToSupabase(exotelUrl, callSid) {
        try {
            this.logger.log(`Fetching Exotel recording from: ${exotelUrl}`);
            const apiKey = process.env.EXOTEL_API_KEY;
            const apiToken = process.env.EXOTEL_API_TOKEN;
            const auth = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
            const response = await (0, node_fetch_1.default)(exotelUrl, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch recording from Exotel: ${response.statusText}`);
            }
            const buffer = await response.buffer();
            const supabaseUrl = process.env.SUPABASE_URL ||
                'https://aws-1-ap-southeast-1.pooler.supabase.com';
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
            const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
            const fileName = `Call-Recording/${callSid}_${Date.now()}.mp3`;
            this.logger.log(`Uploading recording to Supabase: ${fileName}`);
            const { data, error } = await supabase.storage
                .from('project-files')
                .upload(fileName, buffer, {
                contentType: 'audio/mpeg',
                upsert: true,
            });
            if (error) {
                throw error;
            }
            const { data: publicData } = supabase.storage
                .from('project-files')
                .getPublicUrl(fileName);
            this.logger.log(`Successfully uploaded recording to Supabase: ${publicData.publicUrl}`);
            return publicData.publicUrl;
        }
        catch (e) {
            this.logger.error(`Failed to upload recording to Supabase: ${e.message}`);
            return null;
        }
    }
    async dispatchVoiceBot(roomName) {
        this.logger.log(`[AI Voicebot Placeholder] Dispatching AI Voicebot to room: ${roomName}`);
    }
};
exports.TelephonyService = TelephonyService;
exports.TelephonyService = TelephonyService = TelephonyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TelephonyService);
//# sourceMappingURL=telephony.service.js.map