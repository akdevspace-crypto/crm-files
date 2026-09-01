"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyAgentController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let LegacyAgentController = class LegacyAgentController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAgents() {
        const agentsList = await this.prisma.agent.findMany({
            where: { isDeleted: false },
            include: {
                user: {
                    select: { email: true, role: true },
                },
            },
        });
        return {
            success: true,
            agents: agentsList.map((agent) => ({
                id: agent.id,
                name: agent.name,
                employeeId: agent.employeeId,
                department: agent.department || 'Sales',
                status: agent.status,
                user: {
                    email: agent.user.email,
                    role: agent.user.role,
                },
            })),
        };
    }
    async createAgent(body) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: body.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('An agent user with this email address already exists.');
            }
            const passwordHash = await bcrypt.hash(body.password || 'password123', 10);
            const user = await this.prisma.user.create({
                data: {
                    email: body.email,
                    passwordHash,
                    role: body.role || 'AGENT',
                },
            });
            const agent = await this.prisma.agent.create({
                data: {
                    userId: user.id,
                    name: body.fullName || 'Anonymous Agent',
                    phone: body.phone || undefined,
                    address: body.address || undefined,
                    city: body.city || undefined,
                    state: body.state || undefined,
                    country: body.country || undefined,
                    zipCode: body.zipCode || undefined,
                    gender: body.gender || undefined,
                    dob: body.dob ? new Date(body.dob) : undefined,
                    employeeId: body.employeeId || undefined,
                    department: body.department || 'Sales',
                    status: body.status || 'AVAILABLE',
                },
            });
            return {
                success: true,
                agent: {
                    id: agent.id,
                    name: agent.name,
                    user: {
                        email: user.email,
                    },
                },
            };
        }
        catch (err) {
            console.error("CRITICAL AGENT CREATION FAILURE:", err);
            throw new common_1.InternalServerErrorException(err.message || 'Failed to create agent');
        }
    }
    async updateAgent(id, body) {
        const agent = await this.prisma.agent.update({
            where: { id },
            data: {
                name: body.name,
                department: body.department,
                status: body.status,
            },
        });
        return {
            success: true,
            agent,
        };
    }
    async deleteAgent(id) {
        await this.prisma.agent.update({
            where: { id },
            data: { isDeleted: true },
        });
        return {
            success: true,
        };
    }
};
exports.LegacyAgentController = LegacyAgentController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LegacyAgentController.prototype, "getAgents", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LegacyAgentController.prototype, "createAgent", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LegacyAgentController.prototype, "updateAgent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LegacyAgentController.prototype, "deleteAgent", null);
exports.LegacyAgentController = LegacyAgentController = __decorate([
    (0, common_1.Controller)('api/v1/agents'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LegacyAgentController);
//# sourceMappingURL=legacy-agent.controller.js.map