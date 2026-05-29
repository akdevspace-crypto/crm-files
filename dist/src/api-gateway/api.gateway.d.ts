import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentService } from '../agent/agent.service';
export declare class ApiGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly agentService;
    server: Server;
    private readonly logger;
    constructor(agentService: AgentService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleAgentStatusChange(client: Socket, payload: {
        agentId: string;
        status: any;
    }): Promise<{
        event: string;
        data: any;
    }>;
    handleSdpOffer(client: Socket, payload: {
        targetId: string;
        sdp: any;
    }): void;
    handleIceCandidate(client: Socket, payload: {
        targetId: string;
        candidate: any;
    }): void;
}
