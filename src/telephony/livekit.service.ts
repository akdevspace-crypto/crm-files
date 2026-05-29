import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LivekitService implements OnModuleInit {
  private roomServiceClient: RoomServiceClient;
  private readonly logger = new Logger(LivekitService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const livekitUrl = this.configService.get<string>('LIVEKIT_URL');
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (!livekitUrl || !apiKey || !apiSecret) {
      this.logger.warn(
        'LiveKit configuration is missing in environment variables.',
      );
      return;
    }

    this.roomServiceClient = new RoomServiceClient(
      livekitUrl,
      apiKey,
      apiSecret,
    );
    this.logger.log('LiveKit RoomServiceClient initialized.');
  }

  async createRoom(roomName: string) {
    if (!this.roomServiceClient) {
      this.logger.error('RoomServiceClient is not initialized.');
      throw new Error('LiveKit not configured');
    }

    try {
      this.logger.log(`Attempting to create LiveKit room: ${roomName}`);
      const room = await this.roomServiceClient.createRoom({
        name: roomName,
        emptyTimeout: 10 * 60, // 10 minutes timeout if empty
        maxParticipants: 10,
      });
      this.logger.log(`LiveKit room created successfully: ${room.name}`);
      return room;
    } catch (error) {
      this.logger.error(
        `Failed to create LiveKit room: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async generateAgentToken(
    roomName: string,
    participantName: string,
  ): Promise<string> {
    const { AccessToken } = require('livekit-server-sdk');

    const livekitUrl = this.configService.get<string>('LIVEKIT_URL');
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit configuration missing');
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `agent_${participantName.replace(/\s+/g, '_')}_${Date.now()}`,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });
    return await at.toJwt();
  }

  async hasPublishedTracks(roomName: string): Promise<boolean> {
    if (!this.roomServiceClient) return false;
    try {
      const participants =
        await this.roomServiceClient.listParticipants(roomName);
      // Check if any participant has published at least one track
      return participants.some((p) => p.tracks && p.tracks.length > 0);
    } catch (e) {
      // Room might not exist yet
      return false;
    }
  }
}
