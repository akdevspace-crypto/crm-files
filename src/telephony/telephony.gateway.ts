import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TelephonyService } from './telephony.service';
import { LivekitService } from './livekit.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TelephonyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('TelephonyGateway');

  constructor(
    private readonly telephonyService: TelephonyService,
    private readonly livekitService: LivekitService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Telephony WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Find the agent by socketId and mark them offline
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
    } catch (e) {
      this.logger.error(`Error handling disconnect: ${e.message}`);
    }
  }

  @SubscribeMessage('agent_login')
  async handleAgentLogin(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    // Frontend sends { agentId: "...", name: "..." }
    const { agentId, name } = data;
    this.logger.log(`Agent ${name || agentId} logging in via WebSocket...`);

    if (agentId) {
      try {
        // We use userId here because frontend might be passing user.id as agentId
        // Let's attempt to find by Agent ID first, then by User ID
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
        } else {
          this.logger.warn(
            `Agent login failed: No agent found for ID ${agentId}`,
          );
        }
      } catch (e) {
        this.logger.error(`Agent login error: ${e.message}`);
      }
    }
  }

  @SubscribeMessage('status_update')
  async handleStatusUpdate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { status } = data; // e.g. 'AVAILABLE', 'BUSY', 'OFFLINE'

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
    } catch (e) {
      this.logger.error(`Status update error: ${e.message}`);
    }
  }

  dispatchIncomingCallToAgent(
    socketId: string | null | undefined,
    payload: any,
  ) {
    // Add padding to bypass Ngrok/TCP buffering issues where small payloads are held until another packet (like callEnded) arrives
    const paddedPayload = { ...payload, _padding: ' '.repeat(4096) };
    if (socketId) {
      this.logger.log(
        `Dispatching targeted incoming_call event to agent socket: ${socketId}`,
      );
      // Emit the payload and then force a flush with a massive packet
      this.server.to(socketId).emit('incoming_call', payload);
      this.server.to(socketId).emit('proxy_flush', ' '.repeat(131072)); // 128KB flush
      this.logger.log('SUCCESS: Emit executed for specific socket');
    } else {
      this.logger.warn(
        `No socketId provided for assigned agent. Fallback to global broadcast.`,
      );
      this.server.emit('incoming_call', payload);
      this.server.emit('proxy_flush', ' '.repeat(131072));
      this.logger.log('SUCCESS: Emit executed globally');
    }
  }

  @SubscribeMessage('acceptCall')
  async handleAcceptCall(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Agent accepted call: ${data.callSid}`);
    const agentId = data.agentId || client.handshake.auth?.agentId;

    if (!agentId) {
      this.logger.error(`No agentId provided for acceptCall ${data.callSid}`);
      return;
    }

    await this.telephonyService.acceptCallSession(data.callSid, agentId);
  }

  @SubscribeMessage('endCall')
  async handleEndCall(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Call ended by frontend: ${data.callSid}, duration: ${data.duration}`,
    );
    await this.telephonyService.endCallSession(data.callSid, data.duration);

    // Broadcast if necessary
    // this.server.emit('callEnded', { callSid: data.callSid });
  }
}
