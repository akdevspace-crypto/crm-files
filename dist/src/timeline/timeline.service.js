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
var TimelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const live_gateway_1 = require("../websockets/live.gateway");
let TimelineService = TimelineService_1 = class TimelineService {
    prisma;
    liveGateway;
    logger = new common_1.Logger(TimelineService_1.name);
    constructor(prisma, liveGateway) {
        this.prisma = prisma;
        this.liveGateway = liveGateway;
    }
    async logEvent(data) {
        try {
            this.logger.log(`Logging timeline event: ${data.title}`);
            const event = await this.prisma.clientTimelineEvent.create({
                data,
            });
            if (data.leadId) {
                this.liveGateway.broadcastLeadEvent(data.leadId, 'lead-action-completed', { eventId: event.id });
            }
            return event;
        }
        catch (error) {
            this.logger.error(`Failed to log timeline event: ${error.message}`);
        }
    }
    async getTimeline(entityId, type) {
        const events = await this.prisma.clientTimelineEvent.findMany({
            where: type === 'lead' ? { leadId: entityId } : { customerId: entityId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, email: true, agentProfile: { select: { name: true } } } } },
        });
        return events.map(event => ({
            ...event,
            user: event.user ? {
                id: event.user.id,
                name: event.user.agentProfile?.name || event.user.email
            } : null
        }));
    }
};
exports.TimelineService = TimelineService;
exports.TimelineService = TimelineService = TimelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        live_gateway_1.LiveGateway])
], TimelineService);
//# sourceMappingURL=timeline.service.js.map