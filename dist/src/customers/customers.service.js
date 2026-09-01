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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const timeline_service_1 = require("../timeline/timeline.service");
let CustomersService = CustomersService_1 = class CustomersService {
    prisma;
    timelineService;
    logger = new common_1.Logger(CustomersService_1.name);
    constructor(prisma, timelineService) {
        this.prisma = prisma;
        this.timelineService = timelineService;
    }
    async mergeCustomers(primaryId, duplicateId, adminUserId) {
        if (primaryId === duplicateId) {
            throw new common_1.BadRequestException('Primary and duplicate IDs cannot be the same.');
        }
        const primary = await this.prisma.customer.findUnique({ where: { id: primaryId } });
        const duplicate = await this.prisma.customer.findUnique({ where: { id: duplicateId } });
        if (!primary || !duplicate) {
            throw new common_1.NotFoundException('One or both customer records not found.');
        }
        this.logger.log(`Merging customer ${duplicateId} into ${primaryId} by admin ${adminUserId}`);
        await this.prisma.$transaction(async (tx) => {
            await tx.customerNote.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.servicePlan.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.conversation.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.ticket.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.callLog.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.callSession.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.billing.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.quotation.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.order.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.subscription.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.appointment.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.crmTask.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.platformIdentity.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.activity.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.clientTimelineEvent.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
            await tx.customer.delete({ where: { id: duplicateId } });
        });
        await this.timelineService.logEvent({
            customerId: primaryId,
            userId: adminUserId,
            eventType: 'CUSTOMER_MERGE',
            title: 'Customer Profile Merged',
            description: `Duplicate profile (Name: ${duplicate.name}, Phone: ${duplicate.phone}) was merged into this primary record.`,
            department: 'System Administration',
            status: 'COMPLETED',
        });
        return { message: 'Customers merged successfully', primaryId };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = CustomersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        timeline_service_1.TimelineService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map