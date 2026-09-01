import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LegacyAgentController } from './legacy-agent.controller';
import { UserRepository } from './user.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserController, LegacyAgentController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
