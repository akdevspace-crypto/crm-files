import { IsNotEmpty, IsString, IsOptional, IsJSON, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrgDto {
  @ApiProperty({ example: 'Paramantra Enterprise' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '29ABCDE1234F1Z5', required: false })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiProperty({ example: '100 Innovation Way', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Bangalore', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'India', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Asia/Kolkata', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  businessHours?: any;
}

export class UpdateOrgDto extends CreateOrgDto {}

export class CreateBranchDto {
  @ApiProperty({ example: 'North Branch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Avenue Road', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}
