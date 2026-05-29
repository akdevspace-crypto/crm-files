import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TelephonyService } from './telephony.service';
import { LivekitService } from './livekit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TelephonyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly telephonyService;
    private readonly livekitService;
    private readonly prisma;
    server: Server;
    private logger;
    constructor(telephonyService: TelephonyService, livekitService: LivekitService, prisma: PrismaService);
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): Promise<void>;
    handleAgentLogin(data: any, client: Socket): Promise<void>;
    handleStatusUpdate(data: any, client: Socket): Promise<void>;
    dispatchIncomingCallToAgent(socketId: string | null | undefined, payload: any): void;
    handleAcceptCall(data: any, client: Socket): Promise<void>;
    handleEndCall(data: any, client: Socket): Promise<void>;
}
