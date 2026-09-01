import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Agent Smith', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Customer Support', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: '102', required: false })
  @IsOptional()
  @IsString()
  extension?: string;

  @ApiProperty({ example: 'fc75cbca-5a45-46e9-9905-521d708e5ebe', required: false })
  @IsOptional()
  @IsString()
  reportingManagerId?: string;

  @ApiProperty({ example: 'SUPPORT_LEAD', required: false })
  @IsOptional()
  @IsString()
  designation?: string;
}

export class AssignRoleDto {
  @ApiProperty({ example: 'fc75cbca-5a45-46e9-9905-521d708e5ebe' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}

export class UserStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
