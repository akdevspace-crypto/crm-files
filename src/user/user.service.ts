import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto, AssignRoleDto, UserStatusDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async getAllUsers() {
    return this.userRepo.findAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.getUserById(id);
    
    // Check hierarchy loops (cannot report to yourself)
    if (dto.reportingManagerId === id) {
      throw new BadRequestException('Reporting hierarchy error: A user cannot report to themselves.');
    }

    // Update Agent Profile
    return this.userRepo.updateAgentProfile(id, {
      name: dto.name,
      department: dto.department,
      extension: dto.extension,
    });
  }

  async assignUserRole(id: string, dto: AssignRoleDto) {
    await this.getUserById(id);
    return this.userRepo.assignRole(id, dto.roleId);
  }

  async revokeUserRole(id: string, roleId: string) {
    await this.getUserById(id);
    return this.userRepo.removeRole(id, roleId);
  }

  async toggleUserStatus(id: string, dto: UserStatusDto) {
    await this.getUserById(id);
    return this.userRepo.updateStatus(id, dto.isActive);
  }
}
