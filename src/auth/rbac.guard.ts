import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User session not found');
    }

    // Direct check for SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Fetch user roles and associated permissions from the database
    const userWithRolesAndPermissions = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRolesAndPermissions) {
      return false;
    }

    // Extract unique permission codes from user roles
    const userPermissions = new Set<string>();
    for (const assignment of userWithRolesAndPermissions.userRoles) {
      for (const rolePerm of assignment.role.permissions) {
        userPermissions.add(rolePerm.permission.code);
      }
    }

    // Ensure user has ALL of the required permissions
    const hasAll = requiredPermissions.every((perm) => userPermissions.has(perm));
    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
