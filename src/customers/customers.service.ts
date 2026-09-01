import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineService: TimelineService,
  ) {}

  async mergeCustomers(primaryId: string, duplicateId: string, adminUserId: string) {
    if (primaryId === duplicateId) {
      throw new BadRequestException('Primary and duplicate IDs cannot be the same.');
    }

    const primary = await this.prisma.customer.findUnique({ where: { id: primaryId } });
    const duplicate = await this.prisma.customer.findUnique({ where: { id: duplicateId } });

    if (!primary || !duplicate) {
      throw new NotFoundException('One or both customer records not found.');
    }

    this.logger.log(`Merging customer ${duplicateId} into ${primaryId} by admin ${adminUserId}`);

    // Perform the merge in a transaction
    await this.prisma.$transaction(async (tx) => {
      // 1. Transfer Relations
      
      // Notes
      await tx.customerNote.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Service Plans
      await tx.servicePlan.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Conversations
      await tx.conversation.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Tickets
      await tx.ticket.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // CallLogs
      await tx.callLog.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // CallSessions
      await tx.callSession.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Billings
      await tx.billing.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Quotations
      await tx.quotation.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Orders
      await tx.order.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Subscriptions
      await tx.subscription.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Appointments
      await tx.appointment.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // CRM Tasks
      await tx.crmTask.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Platform Identities
      await tx.platformIdentity.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Activities
      await tx.activity.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });
      
      // Client Timeline Events
      await tx.clientTimelineEvent.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } });

      // Lead references (if any exist pointing to customerId, though schema.prisma points Lead to user/agent mainly, wait, Lead has no customerId relation, it has its own record. We don't need to update Lead)

      // 2. Delete the duplicate customer record
      await tx.customer.delete({ where: { id: duplicateId } });
    });

    // 3. Log the merge event on the primary timeline
    await this.timelineService.logEvent({
      customerId: primaryId,
      userId: adminUserId, // Ideally we resolve agentId, but timeline schema can take userId if adapted, or we leave it generic.
      eventType: 'CUSTOMER_MERGE',
      title: 'Customer Profile Merged',
      description: `Duplicate profile (Name: ${duplicate.name}, Phone: ${duplicate.phone}) was merged into this primary record.`,
      department: 'System Administration',
      status: 'COMPLETED',
    });

    return { message: 'Customers merged successfully', primaryId };
  }
}
