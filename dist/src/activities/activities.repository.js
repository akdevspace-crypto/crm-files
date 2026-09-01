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
exports.ActivitiesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ActivitiesRepository = class ActivitiesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(where) {
        return this.prisma.activity.findMany({
            where,
            include: {
                comments: true,
                attachments: true,
                customer: true,
                lead: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return this.prisma.activity.findUnique({
            where: { id },
            include: {
                comments: true,
                attachments: true,
            },
        });
    }
    async create(data) {
        return this.prisma.activity.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.activity.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.activity.delete({
            where: { id },
        });
    }
    async addComment(activityId, authorId, content) {
        return this.prisma.comment.create({
            data: {
                activityId,
                authorId,
                content,
            },
        });
    }
};
exports.ActivitiesRepository = ActivitiesRepository;
exports.ActivitiesRepository = ActivitiesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivitiesRepository);
//# sourceMappingURL=activities.repository.js.map