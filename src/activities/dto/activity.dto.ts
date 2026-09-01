import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ActivityType {
  CALL = 'CALL',
  MEETING = 'MEETING',
  EMAIL = 'EMAIL',
  TASK = 'TASK',
  WHATSAPP = 'WHATSAPP',
  SITE_VISIT = 'SITE_VISIT',
}

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType, example: 'CALL' })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ example: 'Discussed premium pricing options' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Customer called to request a price quotation', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-05-21T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 'PENDING', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'Linked Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false, description: 'Linked Lead ID' })
  @IsOptional()
  @IsString()
  leadId?: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Supervisor feedback: Pricing approved.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
