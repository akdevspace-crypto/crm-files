import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiProperty({ required: false, example: '2026-07-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2026-07-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, example: 'Management' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false, example: 'North Team' })
  @IsOptional()
  @IsString()
  team?: string;

  @ApiProperty({ required: false, example: 'agent-uuid-here' })
  @IsOptional()
  @IsString()
  agentId?: string;
}
