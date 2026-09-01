import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.organization.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: { branches: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async addBranch(orgId: string, name: string, address?: string) {
    return this.prisma.branch.create({
      data: {
        organizationId: orgId,
        name,
        address,
      },
    });
  }

  async findBranchById(branchId: string) {
    return this.prisma.branch.findUnique({
      where: { id: branchId },
    });
  }

  async deleteBranch(branchId: string) {
    return this.prisma.branch.delete({
      where: { id: branchId },
    });
  }
}
