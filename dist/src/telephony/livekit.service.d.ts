import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class LivekitService implements OnModuleInit {
    private configService;
    private roomServiceClient;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    createRoom(roomName: string): Promise<import("livekit-server-sdk").Room>;
    generateAgentToken(roomName: string, participantName: string): Promise<string>;
    hasPublishedTracks(roomName: string): Promise<boolean>;
}
