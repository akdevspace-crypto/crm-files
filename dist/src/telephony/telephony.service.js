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
const timeline_service_1 = require("../timeline/timeline.service");
const ai_speech_service_1 = require("./ai-speech.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let TelephonyService = TelephonyService_1 = class TelephonyService {
    prisma;
    timelineService;
    aiSpeechService;
    eventEmitter;
    logger = new common_1.Logger(TelephonyService_1.name);
    constructor(prisma, timelineService, aiSpeechService, eventEmitter) {
        this.prisma = prisma;
        this.timelineService = timelineService;
        this.aiSpeechService = aiSpeechService;
        this.eventEmitter = eventEmitter;
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
            if (duration > 0 || session.participants.length > 0) {
                this.aiSpeechService.processSpeechIntelligence(session.id).catch(err => {
                    this.logger.error(`AI Speech processing failed in background: ${err.message}`);
                });
            }
            this.eventEmitter.emit('call.ended', session);
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
    async getAiSummaries() {
        return await this.prisma.callAnalytics.findMany({
            where: { summary: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                callSession: {
                    include: {
                        customer: { select: { name: true, phone: true } },
                        participants: {
                            where: { role: 'AGENT' }
                        }
                    }
                }
            }
        });
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
    async handleOutboundCallRequest(lead) {
        this.logger.log(`Received automated outbound call request for lead ${lead?.id}`);
        if (lead) {
            await this.triggerAiCallBot(lead);
        }
    }
    async triggerAiCallBot(lead) {
        this.logger.log(`Triggering AI Call Bot for lead ${lead.id}`);
        const roomName = `ai_bot_${lead.id}_${Date.now()}`;
        await this.createCallSession(`outbound_ai_${lead.id}`, roomName, undefined, undefined);
        const livekitSipDomain = '4c0ct02u07s.sip.livekit.cloud';
        this.logger.log(`Dispatching AI Voicebot SIP trunk: sip:${roomName}@${livekitSipDomain} for lead phone ${lead.phoneNumber}`);
        await this.prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'IN_PROGRESS' },
        });
        await this.timelineService.logEvent({
            leadId: lead.id,
            eventType: 'AI_BOT_CALL',
            title: 'AI Bot Triggered',
            description: `Outbound AI call initiated for ${lead.phoneNumber}`,
            department: 'AI Automation',
            communication: 'Outbound Call',
            status: 'COMPLETED',
        });
    }
    async getGenericAgent() {
        let agent = await this.prisma.agent.findFirst({
            where: { status: 'AVAILABLE' }
        });
        if (!agent) {
            agent = await this.prisma.agent.findFirst();
        }
        return agent;
    }
    async saveAiBotResults(leadId, botData, agentId) {
        const notes = `AI Bot Summary:
Requirement: ${botData.requirement || 'N/A'}
Preferred Service: ${botData.service || 'N/A'}
Callback Time: ${botData.callbackTime || 'N/A'}
Transcript: ${botData.transcript || ''}`;
        await this.prisma.lead.update({
            where: { id: leadId },
            data: { notes },
        });
        await this.prisma.leadNote.create({
            data: {
                leadId,
                agentId: agentId || null,
                department: 'AI Bot',
                content: notes,
            }
        });
        if (agentId) {
            await this.prisma.crmTask.create({
                data: {
                    agentId,
                    title: `AI Follow-up: ${botData.service || 'Lead'}`,
                    description: notes,
                    status: 'TODO',
                    priority: 'HIGH',
                }
            });
            this.logger.log(`Saved AI results and created follow-up task for lead ${leadId}`);
        }
        await this.timelineService.logEvent({
            leadId: leadId,
            userId: agentId,
            eventType: 'FOLLOW_UP',
            title: 'Follow-up #1 (AI)',
            description: `AI Extracted Requirement: ${botData.requirement || 'N/A'}, Service: ${botData.service || 'N/A'}, Callback: ${botData.callbackTime || 'N/A'}`,
            department: 'AI Automation',
            communication: 'AI Summary',
            status: 'COMPLETED',
        });
    }
};
exports.TelephonyService = TelephonyService;
__decorate([
    (0, event_emitter_1.OnEvent)('call.outbound.requested'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelephonyService.prototype, "handleOutboundCallRequest", null);
exports.TelephonyService = TelephonyService = TelephonyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        timeline_service_1.TimelineService,
        ai_speech_service_1.AiSpeechService,
        event_emitter_1.EventEmitter2])
], TelephonyService);
//# sourceMappingURL=telephony.service.js.map