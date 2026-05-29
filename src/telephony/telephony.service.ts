import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

@Injectable()
export class TelephonyService {
  private readonly logger = new Logger(TelephonyService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // CRM CONTEXT & VOICEBOT
  // ==========================================
  async lookupCustomerContext(phoneNumber: string) {
    this.logger.log(`Looking up customer context for phone: ${phoneNumber}`);
    try {
      // Search in Customer table
      const customer = await this.prisma.customer.findUnique({
        where: { phone: phoneNumber },
        include: { servicePlans: true, tickets: true }, // Included tickets
      });

      // Search in Lead table
      const lead = await this.prisma.lead.findUnique({
        where: { phoneNumber },
        include: { assignedAgent: true },
      });

      return {
        customer: customer || lead || null,
        priority: customer ? (customer as any).priority || 'Normal' : 'Normal',
        servicePlans: customer?.servicePlans || [],
        tickets: customer?.tickets || [],
      };
    } catch (error) {
      this.logger.error(
        `Error looking up customer context: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  // ==========================================
  // CALL SESSION TRACKING (PHASE 8)
  // ==========================================
  async createCallSession(
    callSid: string,
    roomName: string,
    customerId?: string,
    agentId?: string,
  ) {
    this.logger.log(`Creating CallSession for ${callSid} in room ${roomName}`);
    try {
      return await this.prisma.callSession.create({
        data: {
          reason: callSid, // Store Exotel CallSid here since it's not a valid UUID
          customerId,
          calleeUserId: agentId, // mapped to agent user ID theoretically
          status: 'RINGING',
          startedAt: new Date(),
          livekitRoom: roomName,
          participants: {
            create: [], // will add later on connect
          },
        },
      });
    } catch (e) {
      this.logger.error(`Failed to create CallSession: ${e.message}`);
    }
  }

  async acceptCallSession(callSid: string, userIdOrAgentId: string) {
    this.logger.log(`Agent ${userIdOrAgentId} accepted CallSession ${callSid}`);
    try {
      // Find session by callSid stored in reason
      const session = await this.prisma.callSession.findFirst({
        where: { reason: callSid },
      });
      if (!session) return;

      // Resolve actual Agent ID (since socket passes User ID)
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
    } catch (e) {
      this.logger.error(`Failed to accept CallSession: ${e.message}`);
    }
  }

  async endCallSession(
    callSid: string,
    duration: number = 0,
    exotelRecordingUrl: string | null = null,
  ) {
    this.logger.log(`Ending CallSession ${callSid}`);
    try {
      const session = await this.prisma.callSession.findFirst({
        where: { reason: callSid },
        include: { participants: true },
      });
      if (!session) return;

      let finalRecordingUrl = null;

      // If we received an Exotel recording URL, upload it to Supabase
      if (exotelRecordingUrl) {
        finalRecordingUrl = await this.uploadRecordingToSupabase(
          exotelRecordingUrl,
          callSid,
        );
      }

      await this.prisma.callSession.update({
        where: { id: session.id },
        data: {
          endedAt: new Date(),
          duration: duration,
          recordingUrl: finalRecordingUrl || undefined,
          status:
            duration === 0 && session.status === 'RINGING' ? 'MISSED' : 'ENDED',
        },
      });

      // Mark agent as AVAILABLE again
      const agentParticipant = session.participants.find(
        (p) => p.role === 'AGENT' && p.agentId,
      );
      if (agentParticipant && agentParticipant.agentId) {
        await this.prisma.agent.update({
          where: { id: agentParticipant.agentId },
          data: { status: 'AVAILABLE', activeCalls: 0 },
        });

        await this.prisma.callParticipant.update({
          where: { id: agentParticipant.id },
          data: { leftAt: new Date() },
        });
      } else if (session.calleeUserId) {
        // If the call was missed/canceled before the agent accepted,
        // calleeUserId holds the User ID of the assigned agent. Release them!
        await this.prisma.agent.updateMany({
          where: { userId: session.calleeUserId },
          data: { status: 'AVAILABLE', activeCalls: 0 },
        });
      }
    } catch (e) {
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

  async getMyRingingCall(agentId: string) {
    if (!agentId) return null;

    // Find a ringing call session assigned to this agent
    const callSession = await this.prisma.callSession.findFirst({
      where: {
        status: 'RINGING',
        participants: {
          some: { agentId: agentId, role: 'AGENT' },
        },
      },
      include: { customer: true, participants: true },
    });

    if (!callSession) return null;

    // Generate token
    const agent = await this.prisma.agent.findUnique({
      where: { userId: agentId },
    });
    if (!agent) return null;

    const { LivekitService } = require('./livekit.service');
    // We cannot easily inject LivekitService here due to circular dependency, so we will generate token manually or pass it in.
    // Wait, let's just do it in the controller which has access to LivekitService!

    return { callSession, agent };
  }

  private async uploadRecordingToSupabase(
    exotelUrl: string,
    callSid: string,
  ): Promise<string | null> {
    try {
      this.logger.log(`Fetching Exotel recording from: ${exotelUrl}`);
      // Exotel recording URLs require Basic Auth using API Key and Token
      const apiKey = process.env.EXOTEL_API_KEY;
      const apiToken = process.env.EXOTEL_API_TOKEN;
      const auth = Buffer.from(`${apiKey}:${apiToken}`).toString('base64');

      const response = await fetch(exotelUrl, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch recording from Exotel: ${response.statusText}`,
        );
      }

      const buffer = await response.buffer();

      const supabaseUrl =
        process.env.SUPABASE_URL ||
        'https://aws-1-ap-southeast-1.pooler.supabase.com';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
      const supabase = createClient(supabaseUrl, supabaseKey);

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

      this.logger.log(
        `Successfully uploaded recording to Supabase: ${publicData.publicUrl}`,
      );
      return publicData.publicUrl;
    } catch (e) {
      this.logger.error(`Failed to upload recording to Supabase: ${e.message}`);
      return null;
    }
  }

  async dispatchVoiceBot(roomName: string) {
    // Placeholder for AI Voicebot dispatch logic (OpenAI Realtime)
    this.logger.log(
      `[AI Voicebot Placeholder] Dispatching AI Voicebot to room: ${roomName}`,
    );
  }
}
