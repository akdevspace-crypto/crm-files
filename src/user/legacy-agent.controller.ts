import { Controller, Get, Post, Put, Delete, Param, Body, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('api/v1/agents')
export class LegacyAgentController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
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

  @Post('create')
  async createAgent(@Body() body: any) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: body.email },
      });
      
      if (existingUser) {
        throw new ConflictException('An agent user with this email address already exists.');
      }

      const passwordHash = await bcrypt.hash(body.password || 'password123', 10);
      
      // Create User record
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          role: body.role || 'AGENT',
        },
      });

      // Create Agent profile linked to user
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
    } catch (err: any) {
      console.error("CRITICAL AGENT CREATION FAILURE:", err);
      throw new InternalServerErrorException(err.message || 'Failed to create agent');
    }
  }

  @Put(':id')
  async updateAgent(@Param('id') id: string, @Body() body: any) {
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

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    await this.prisma.agent.update({
      where: { id },
      data: { isDeleted: true },
    });

    return {
      success: true,
    };
  }
}
