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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserRepository = class UserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.user.findMany({
            include: {
                agentProfile: true,
                userRoles: {
                    include: { role: true },
                },
            },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                agentProfile: true,
                userRoles: {
                    include: { role: true },
                },
            },
        });
    }
    async updateAgentProfile(userId, data) {
        const existingAgent = await this.prisma.agent.findUnique({
            where: { userId },
        });
        if (existingAgent) {
            return this.prisma.agent.update({
                where: { userId },
                data: {
                    name: data.name,
                    department: data.department,
                    extension: data.extension,
                },
            });
        }
        else {
            return this.prisma.agent.create({
                data: {
                    userId,
                    name: data.name || 'New Agent',
                    department: data.department || 'General',
                    extension: data.extension || undefined,
                    status: 'OFFLINE',
                },
            });
        }
    }
    async assignRole(userId, roleId) {
        return this.prisma.userRoleAssignment.upsert({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
            update: {},
            create: {
                userId,
                roleId,
            },
        });
    }
    async removeRole(userId, roleId) {
        return this.prisma.userRoleAssignment.delete({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
        });
    }
    async updateStatus(userId, isActive) {
        return this.prisma.agent.update({
            where: { userId },
            data: {
                isDeleted: !isActive,
                status: isActive ? 'AVAILABLE' : 'OFFLINE',
            },
        });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserRepository);
//# sourceMappingURL=user.repository.js.map