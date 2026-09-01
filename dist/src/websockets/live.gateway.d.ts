import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinLeadRoom(leadId: string, client: Socket): {
        event: string;
        data: string;
    };
    handleLeaveLeadRoom(leadId: string, client: Socket): {
        event: string;
        data: string;
    };
    broadcastLeadEvent(leadId: string, event: string, data: any): void;
}
