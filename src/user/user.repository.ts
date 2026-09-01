import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async findById(id: string) {
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

  async updateAgentProfile(userId: string, data: any) {
    // Upsert agent profile details linked to User
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
    } else {
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

  async assignRole(userId: string, roleId: string) {
    // Upsert role assignments
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

  async removeRole(userId: string, roleId: string) {
    return this.prisma.userRoleAssignment.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  async updateStatus(userId: string, isActive: boolean) {
    // We update isDeleted field on agent profile or handle session expirations
    return this.prisma.agent.update({
      where: { userId },
      data: {
        isDeleted: !isActive,
        status: isActive ? 'AVAILABLE' : 'OFFLINE',
      },
    });
  }
}
