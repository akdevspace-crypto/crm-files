import { Module } from '@nestjs/common';
import { OrgService } from './org.service';
import { OrgController } from './org.controller';
import { OrgRepository } from './org.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OrgController],
  providers: [OrgService, OrgRepository],
  exports: [OrgService],
})
export class OrgModule {}
