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
exports.LeadsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeadsRepository = class LeadsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(where) {
        return this.prisma.lead.findMany({
            where,
            include: {
                assignedAgent: true,
                followups: { orderBy: { followupDate: 'asc' }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return this.prisma.lead.findUnique({
            where: { id },
            include: {
                assignedAgent: true,
                followups: true,
                activities: true,
            },
        });
    }
    async create(data) {
        return this.prisma.lead.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.lead.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.lead.delete({
            where: { id },
        });
    }
    async logConversion(leadId, agentId, oldStatus, newStatus, notes) {
        return this.prisma.leadConversionLog.create({
            data: {
                leadId,
                agentId,
                oldStatus,
                newStatus,
                notes,
            },
        });
    }
    async findAgentByUserId(userId) {
        return this.prisma.agent.findFirst({
            where: { userId },
        });
    }
    async getNotes(leadId) {
        return this.prisma.leadNote.findMany({
            where: { leadId },
            include: {
                agent: {
                    select: { name: true, department: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    async appendNote(data) {
        return this.prisma.leadNote.create({
            data
        });
    }
};
exports.LeadsRepository = LeadsRepository;
exports.LeadsRepository = LeadsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsRepository);
//# sourceMappingURL=leads.repository.js.map