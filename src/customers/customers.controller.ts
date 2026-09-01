import { Controller, Post, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';

@Controller('v1/customers')
@UseGuards(JwtAuthGuard, RbacGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('merge')
  async mergeCustomers(
    @Body('primaryId') primaryId: string,
    @Body('duplicateId') duplicateId: string,
    @Req() req: any
  ) {
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
    if (!allowedRoles.includes(req.user?.role)) {
      throw new ForbiddenException('Insufficient role permissions');
    }
    return this.customersService.mergeCustomers(primaryId, duplicateId, req.user.id);
  }
}
