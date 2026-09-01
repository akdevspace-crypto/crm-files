import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, AssignRoleDto, UserStatusDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all organization users and agents' })
  async listUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile metadata' })
  async getProfile(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile info and manager assignment' })
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Post(':id/roles')
  @RequirePermissions('Org.Update')
  @ApiOperation({ summary: 'Assign dynamic role mapping to user' })
  async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return this.userService.assignUserRole(id, dto);
  }

  @Delete(':id/roles/:roleId')
  @RequirePermissions('Org.Update')
  @ApiOperation({ summary: 'Revoke dynamic role mapping from user' })
  async revokeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.userService.revokeUserRole(id, roleId);
  }

  @Put(':id/status')
  @RequirePermissions('Org.Update')
  @ApiOperation({ summary: 'Activate or deactivate user account' })
  async toggleStatus(@Param('id') id: string, @Body() dto: UserStatusDto) {
    return this.userService.toggleUserStatus(id, dto);
  }
}
