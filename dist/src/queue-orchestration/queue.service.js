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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QueueService = QueueService_1 = class QueueService {
    prisma;
    logger = new common_1.Logger(QueueService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async allocateAgent(department) {
        this.logger.log(`Attempting to allocate agent for department: ${department || 'any'}`);
        try {
            const agent = await this.prisma.agent.findFirst({
                where: {
                    status: 'AVAILABLE',
                    isDeleted: false,
                    ...(department ? { department } : {}),
                },
                orderBy: [{ activeCalls: 'asc' }, { lastAssignedAt: 'asc' }],
            });
            if (!agent) {
                this.logger.warn('No available agents found in queue.');
                return null;
            }
            const updatedAgent = await this.prisma.agent.update({
                where: { id: agent.id },
                data: {
                    activeCalls: { increment: 1 },
                    lastAssignedAt: new Date(),
                    status: 'BUSY',
                },
            });
            this.logger.log(`Allocated agent ${updatedAgent.id} (activeCalls: ${updatedAgent.activeCalls})`);
            return updatedAgent;
        }
        catch (error) {
            this.logger.error(`Error allocating agent: ${error.message}`);
            return null;
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QueueService);
//# sourceMappingURL=queue.service.js.map