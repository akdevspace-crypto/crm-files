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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const activities_repository_1 = require("./activities.repository");
let ActivitiesService = class ActivitiesService {
    activitiesRepo;
    constructor(activitiesRepo) {
        this.activitiesRepo = activitiesRepo;
    }
    async getActivities(customerId, leadId) {
        const where = {};
        if (customerId)
            where.customerId = customerId;
        if (leadId)
            where.leadId = leadId;
        return this.activitiesRepo.findMany(where);
    }
    async getActivityById(id) {
        const activity = await this.activitiesRepo.findById(id);
        if (!activity) {
            throw new common_1.NotFoundException('Activity log not found');
        }
        return activity;
    }
    async createActivity(dto, agentId) {
        return this.activitiesRepo.create({
            type: dto.type,
            subject: dto.subject,
            description: dto.description,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            status: dto.status || 'PENDING',
            customerId: dto.customerId || undefined,
            leadId: dto.leadId || undefined,
            agentId,
        });
    }
    async addActivityComment(activityId, authorId, dto) {
        await this.getActivityById(activityId);
        return this.activitiesRepo.addComment(activityId, authorId, dto.content);
    }
    async deleteActivity(id) {
        await this.getActivityById(id);
        return this.activitiesRepo.delete(id);
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [activities_repository_1.ActivitiesRepository])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map