import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto, UpdateOrgDto, CreateBranchDto } from './dto/org.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('organizations')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve organization metadata and branches' })
  async getOrg(@Param('id') id: string) {
    return this.orgService.getOrganization(id);
  }

  @Put(':id')
  @RequirePermissions('Org.Update')
  @ApiOperation({ summary: 'Update organization core business hours and settings' })
  async updateOrg(@Param('id') id: string, @Body() dto: UpdateOrgDto) {
    return this.orgService.updateOrganization(id, dto);
  }

  @Post(':orgId/branches')
  @RequirePermissions('Org.Update')
  @ApiOperation({ summary: 'Add a new corporate branch location' })
  async addBranch(@Param('orgId') orgId: string, @Body() dto: CreateBranchDto) {
    return this.orgService.createBranch(orgId, dto);
  }

  @Delete('branches/:branchId')
  @RequirePermissions('Org.Update')
  @ApiOperation({ summary: 'Delete a branch location' })
  async removeBranch(@Param('branchId') branchId: string) {
    return this.orgService.removeBranch(branchId);
  }
}
