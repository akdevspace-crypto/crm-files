import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Bruce Wayne' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '+15551234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'bruce@wayne.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Elderly Care Services', required: false })
  @IsOptional()
  @IsString()
  serviceInterest?: string;

  @ApiProperty({ example: 'Gotham', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Needs weekend assistance', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'Google Ads', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateLeadDto extends CreateLeadDto {
  @ApiProperty({ example: 'IN_PROGRESS', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'HIGH', required: false })
  @IsOptional()
  @IsString()
  priority?: string;
}

export class LeadStatusUpdateDto {
  @ApiProperty({ example: 'CONVERTED' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 'Customer called back and agreed to plan', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLeadNoteDto {
  @ApiProperty({ example: 'Customer called back and agreed to plan' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsString()
  callId?: string;
}

