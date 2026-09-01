import { IsNotEmpty, IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Discuss service plan options' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '2026-05-21T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2026-05-21T11:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'fc75cbca-5a45-46e9-9905-521d708e5ebe', description: 'Linked Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'SCHEDULED', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'MEETING', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false, description: 'Outlook/Google calendar sync status' })
  @IsOptional()
  @IsBoolean()
  externalSync?: boolean;
}

export class UpdateEventDto extends CreateEventDto {}
