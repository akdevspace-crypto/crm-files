import { Controller, All, Req, Logger, Header, Get } from '@nestjs/common';
import type { Request } from 'express';
import { LivekitService } from './livekit.service';
import { TelephonyService } from './telephony.service';
import { TelephonyGateway } from './telephony.gateway';
import { QueueService } from '../queue-orchestration/queue.service';

@Controller('exotel')
export class TelephonyController {
  private readonly logger = new Logger(TelephonyController.name);

  constructor(
    private readonly livekitService: LivekitService,
    private readonly telephonyService: TelephonyService,
    private readonly telephonyGateway: TelephonyGateway,
    private readonly queueService: QueueService,
  ) {}

  @Get('dashboard-calls')
  async getDashboardCalls() {
    return await this.telephonyService.getDashboardCalls();
  }

  @Get('my-ringing-call')
  async getMyRingingCall(@Req() req: Request) {
    const agentId = req.query.agentId as string;
    if (!agentId) return { call: null };

    const result = await this.telephonyService.getMyRingingCall(agentId);
    if (!result) return { call: null };

    const { callSession, agent } = result;

    // Generate token
    const token = await this.livekitService.generateAgentToken(
      callSession.livekitRoom || `room_${Date.now()}`,
      agent.name || 'Agent',
    );

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

  @All('incoming')
  @Header('Content-Type', 'text/xml')
  async handleIncomingCall(@Req() req: Request) {
    this.logger.log(
      `Received incoming call webhook from Exotel via ${req.method}`,
    );

    // Exotel sends data in body for POST, and query for GET
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
        // 1. Allocate Agent and Lookup Customer Context concurrently
        const [assignedAgent, customerContext] = await Promise.all([
          this.queueService.allocateAgent(),
          this.telephonyService.lookupCustomerContext(callerNumber),
        ]);

        if (!assignedAgent) {
          this.logger.warn(
            `No agents available for call ${callSid} from ${callerNumber}`,
          );
          return `
<Response>
    <Say voice="woman">
        Welcome to Universal Elder Care.
        All our agents are currently busy. Please try again later or leave a message.
    </Say>
</Response>`.trim();
        }

        // 2. Create Call Session tracking record in the background
        this.telephonyService
          .createCallSession(
            callSid as string,
            roomName as string,
            customerContext?.customer?.id,
            assignedAgent.userId,
          )
          .catch((e) =>
            this.logger.error(`Background session creation failed: ${e.message}`),
          );

        // 3. Generate Agent LiveKit Token
        const token = await this.livekitService.generateAgentToken(
          roomName as string,
          assignedAgent.name || 'Agent',
        );

        // 4. Dispatch incoming call event specifically to the assigned agent
        this.telephonyGateway.dispatchIncomingCallToAgent(
          assignedAgent.socketId,
          {
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
          },
        );
      }

      // Exotel does not support the <Redirect> tag in its TwiML parser.
      // Instead of stalling, we immediately bridge the caller to the LiveKit SIP Trunk.
      // The caller will wait in the LiveKit room until the agent connects.
      
      this.logger.log(`Bridging Exotel call directly to LiveKit SIP trunk...`);
      const twimlResponse = `
<Response>
    <Dial action="${baseUrl}/exotel/status">
        <Sip>sip:${roomName}@${livekitSipDomain}</Sip>
    </Dial>
</Response>`.trim();
      this.logger.log(`[DEBUG] Returning TwiML to Provider: \n${twimlResponse}`);
      return twimlResponse;

    } catch (error) {
      this.logger.error(
        `Error processing incoming call: ${error.message}`,
        error.stack,
      );
      return `
<Response>
    <Say voice="woman">
        We are sorry, our systems are currently unavailable. Please try again later.
    </Say>
</Response>`.trim();
    }
  }

  @All('status')
  async handleCallStatus(@Req() req: Request) {
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
}
