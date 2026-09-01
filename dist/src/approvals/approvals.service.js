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
var ApprovalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ApprovalsService = ApprovalsService_1 = class ApprovalsService {
    prisma;
    logger = new common_1.Logger(ApprovalsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRequest(requesterId, type, details) {
        this.logger.log(`User ${requesterId} requesting approval for ${type}`);
        const request = await this.prisma.approvalRequest.create({
            data: {
                requesterId,
                type,
                details,
                status: 'PENDING',
            },
        });
        return { message: 'Approval request created successfully', request };
    }
    async getRequests(status, requesterId) {
        const where = {};
        if (status)
            where.status = status;
        if (requesterId)
            where.requesterId = requesterId;
        const requests = await this.prisma.approvalRequest.findMany({
            where,
            include: {
                requester: { select: { id: true, email: true, role: true, agentProfile: { select: { name: true } } } },
                approver: { select: { id: true, email: true, agentProfile: { select: { name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return requests;
    }
    async reviewRequest(id, approverId, status, notes) {
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            throw new common_1.BadRequestException('Status must be APPROVED or REJECTED');
        }
        const request = await this.prisma.approvalRequest.findUnique({ where: { id } });
        if (!request) {
            throw new common_1.NotFoundException(`Approval Request ${id} not found`);
        }
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Request is already ${request.status}`);
        }
        this.logger.log(`Supervisor ${approverId} marked request ${id} as ${status}`);
        const updatedRequest = await this.prisma.approvalRequest.update({
            where: { id },
            data: {
                status,
                approverId,
                notes,
                resolvedAt: new Date(),
            },
            include: {
                requester: { select: { id: true, email: true } },
            }
        });
        return { message: `Request ${status.toLowerCase()} successfully`, updatedRequest };
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = ApprovalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map