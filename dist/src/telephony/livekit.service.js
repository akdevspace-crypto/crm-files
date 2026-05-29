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
var LivekitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivekitService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const livekit_server_sdk_1 = require("livekit-server-sdk");
let LivekitService = LivekitService_1 = class LivekitService {
    configService;
    roomServiceClient;
    logger = new common_1.Logger(LivekitService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const livekitUrl = this.configService.get('LIVEKIT_URL');
        const apiKey = this.configService.get('LIVEKIT_API_KEY');
        const apiSecret = this.configService.get('LIVEKIT_API_SECRET');
        if (!livekitUrl || !apiKey || !apiSecret) {
            this.logger.warn('LiveKit configuration is missing in environment variables.');
            return;
        }
        this.roomServiceClient = new livekit_server_sdk_1.RoomServiceClient(livekitUrl, apiKey, apiSecret);
        this.logger.log('LiveKit RoomServiceClient initialized.');
    }
    async createRoom(roomName) {
        if (!this.roomServiceClient) {
            this.logger.error('RoomServiceClient is not initialized.');
            throw new Error('LiveKit not configured');
        }
        try {
            this.logger.log(`Attempting to create LiveKit room: ${roomName}`);
            const room = await this.roomServiceClient.createRoom({
                name: roomName,
                emptyTimeout: 10 * 60,
                maxParticipants: 10,
            });
            this.logger.log(`LiveKit room created successfully: ${room.name}`);
            return room;
        }
        catch (error) {
            this.logger.error(`Failed to create LiveKit room: ${error.message}`, error.stack);
            throw error;
        }
    }
    async generateAgentToken(roomName, participantName) {
        const { AccessToken } = require('livekit-server-sdk');
        const livekitUrl = this.configService.get('LIVEKIT_URL');
        const apiKey = this.configService.get('LIVEKIT_API_KEY');
        const apiSecret = this.configService.get('LIVEKIT_API_SECRET');
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
    async hasPublishedTracks(roomName) {
        if (!this.roomServiceClient)
            return false;
        try {
            const participants = await this.roomServiceClient.listParticipants(roomName);
            return participants.some((p) => p.tracks && p.tracks.length > 0);
        }
        catch (e) {
            return false;
        }
    }
};
exports.LivekitService = LivekitService;
exports.LivekitService = LivekitService = LivekitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LivekitService);
//# sourceMappingURL=livekit.service.js.map