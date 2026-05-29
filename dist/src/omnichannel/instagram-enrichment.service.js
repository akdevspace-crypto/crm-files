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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InstagramProfileEnrichmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramProfileEnrichmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ioredis_1 = require("ioredis");
let InstagramProfileEnrichmentService = InstagramProfileEnrichmentService_1 = class InstagramProfileEnrichmentService {
    prisma;
    redis;
    logger = new common_1.Logger(InstagramProfileEnrichmentService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async enrichProfile(customerId, platformUserId) {
        this.logger.log(`Enriching Instagram profile for Customer ${customerId} (Platform UID: ${platformUserId})`);
        const cacheKey = `ig_profile:${platformUserId}`;
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                this.logger.log(`Found cached profile for IGSID ${platformUserId}`);
                const profile = JSON.parse(cached);
                await this.updateCustomerIdentity(customerId, platformUserId, profile);
                return profile;
            }
        }
        catch (err) {
            this.logger.warn(`Redis cache read failed: ${err.message}`);
        }
        let accessToken = process.env.META_PAGE_ACCESS_TOKEN ||
            process.env.META_ACCESS_TOKEN ||
            process.env.ACCESS_TOKEN ||
            'IGAAOguCTltA9BZAGF1eWE4cEt1dGRRNGJSX1pNOE5ZATHJwaUxpZAG91YV9PTkd0c0NUTlJmQ2M2WjlGNURuN2ZA4Y25LeE5WejNFQ0haTmJhQW9DU0pOVGExRmREUkJ0VUlJbTJrSk00RDY0OGNHbmZAxbkhPaF9BX0x2ZAE8xZAUhqbwZDZD';
        if (accessToken.startsWith('IG') && process.env.WHATSAPP_TOKEN) {
            this.logger.log('Detected legacy IG token prefix. Falling back to WHATSAPP_TOKEN for Facebook Graph API request.');
            accessToken = process.env.WHATSAPP_TOKEN;
        }
        const fields = 'username,profile_pic';
        const url = `https://graph.facebook.com/v22.0/${platformUserId}?fields=${fields}&access_token=${accessToken}`;
        try {
            this.logger.log(`Instagram Enrichment Request URL: ${url}`);
            const response = await fetch(url);
            const data = await response.json();
            this.logger.log(`Instagram Enrichment Response: ${JSON.stringify(data)}`);
            if (!response.ok || data.error) {
                const errorMsg = data.error?.message || 'Meta API error';
                this.logger.error(`Meta Graph API failure: ${errorMsg}. Error Code: ${data.error?.code}, Type: ${data.error?.type}`);
                console.log('META PROFILE ERROR:', data.error || errorMsg);
                this.logger.warn(`Using fallback mock profile for ${platformUserId} due to Meta API error.`);
                const mockProfile = {
                    username: `Instagram Contact`,
                    profilePictureUrl: ``,
                    id: platformUserId,
                    enrichmentFailed: true,
                };
                try {
                    await this.redis.set(cacheKey, JSON.stringify(mockProfile), 'EX', 24 * 60 * 60);
                }
                catch (cacheErr) {
                    this.logger.warn(`Failed to write to Redis cache: ${cacheErr.message}`);
                }
                await this.updateCustomerIdentity(customerId, platformUserId, mockProfile);
                return mockProfile;
            }
            if (!data.username) {
                this.logger.error(`Missing username error: Meta API did not return a username for user ${platformUserId}`);
                console.log('META PROFILE ERROR:', 'Missing username in response');
                throw new Error('Meta API returned empty username');
            }
            console.log('META PROFILE RESPONSE:', data);
            const profile = {
                username: data.username,
                profilePictureUrl: data.profile_pic || '',
                id: data.id,
                enrichmentFailed: false,
            };
            try {
                await this.redis.set(cacheKey, JSON.stringify(profile), 'EX', 24 * 60 * 60);
            }
            catch (cacheErr) {
                this.logger.warn(`Failed to write to Redis cache: ${cacheErr.message}`);
            }
            await this.updateCustomerIdentity(customerId, platformUserId, profile);
            return profile;
        }
        catch (err) {
            this.logger.error(`Failed to enrich Instagram profile: ${err.message}`);
            throw err;
        }
    }
    async updateCustomerIdentity(customerId, platformUserId, profile) {
        const handle = profile.username === 'Instagram Contact'
            ? 'Instagram Contact'
            : `@${profile.username}`;
        await this.prisma.customer.update({
            where: { id: customerId },
            data: {
                name: handle,
                instagramUsername: handle,
                instagramProfilePic: profile.profilePictureUrl,
                profileEnriched: !profile.enrichmentFailed,
                lastProfileSync: new Date(),
            },
        });
        const existingIdentity = await this.prisma.platformIdentity.findFirst({
            where: { customerId, platform: 'INSTAGRAM', platformUserId },
        });
        if (existingIdentity) {
            await this.prisma.platformIdentity.update({
                where: { id: existingIdentity.id },
                data: {
                    username: handle,
                    profilePicture: profile.profilePictureUrl,
                    updatedAt: new Date(),
                },
            });
        }
        else {
            await this.prisma.platformIdentity.create({
                data: {
                    customerId,
                    platform: 'INSTAGRAM',
                    platformUserId,
                    username: handle,
                    profilePicture: profile.profilePictureUrl,
                },
            });
        }
        try {
            const payload = {
                type: 'instagram_profile_updated',
                data: {
                    customerId,
                    instagramUsername: handle,
                    instagramProfilePic: profile.profilePictureUrl,
                    name: handle,
                    enrichmentFailed: profile.enrichmentFailed || false,
                },
            };
            await this.redis.publish('omnichannel_events', JSON.stringify(payload));
            this.logger.log(`Published profile update event to Redis Pub/Sub for customer ${customerId}`);
        }
        catch (pubErr) {
            this.logger.warn(`Redis publish failed: ${pubErr.message}`);
        }
    }
};
exports.InstagramProfileEnrichmentService = InstagramProfileEnrichmentService;
exports.InstagramProfileEnrichmentService = InstagramProfileEnrichmentService = InstagramProfileEnrichmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ioredis_1.Redis])
], InstagramProfileEnrichmentService);
//# sourceMappingURL=instagram-enrichment.service.js.map