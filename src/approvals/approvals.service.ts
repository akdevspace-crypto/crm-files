import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createRequest(requesterId: string, type: string, details: any) {
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

  async getRequests(status?: string, requesterId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (requesterId) where.requesterId = requesterId;

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

  async reviewRequest(id: string, approverId: string, status: 'APPROVED' | 'REJECTED', notes: string) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Status must be APPROVED or REJECTED');
    }

    const request = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Approval Request ${id} not found`);
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Request is already ${request.status}`);
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

    // We can emit an event here to trigger an automated notification to the requester.
    // this.eventEmitter.emit('approval.reviewed', updatedRequest);

    return { message: `Request ${status.toLowerCase()} successfully`, updatedRequest };
  }
}
