import { Injectable, NotFoundException } from '@nestjs/common';
import { OrgRepository } from './org.repository';
import { CreateOrgDto, UpdateOrgDto, CreateBranchDto } from './dto/org.dto';

@Injectable()
export class OrgService {
  constructor(private readonly orgRepo: OrgRepository) {}

  async createOrganization(dto: CreateOrgDto) {
    return this.orgRepo.create({
      name: dto.name,
      gstNumber: dto.gstNumber,
      address: dto.address,
      city: dto.city,
      country: dto.country,
      timezone: dto.timezone,
      businessHours: dto.businessHours,
    });
  }

  async getOrganization(id: string) {
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new NotFoundException('Organization settings not found');
    }
    return org;
  }

  async updateOrganization(id: string, dto: UpdateOrgDto) {
    await this.getOrganization(id);
    return this.orgRepo.update(id, dto);
  }

  async deleteOrganization(id: string) {
    await this.getOrganization(id);
    return this.orgRepo.delete(id);
  }

  async createBranch(orgId: string, dto: CreateBranchDto) {
    await this.getOrganization(orgId);
    return this.orgRepo.addBranch(orgId, dto.name, dto.address);
  }

  async removeBranch(branchId: string) {
    const branch = await this.orgRepo.findBranchById(branchId);
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return this.orgRepo.deleteBranch(branchId);
  }
}
