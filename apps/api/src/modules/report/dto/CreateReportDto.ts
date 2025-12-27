import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ReportType {
  NUTRITION = 'NUTRITION',
  PROGRESS = 'PROGRESS',
  MEAL_PLAN = 'MEAL_PLAN',
  ACTIVITY = 'ACTIVITY',
  CUSTOM = 'CUSTOM',
}

enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

export class CreateReportDto {
  @ApiProperty({ example: 'Q4 Nutrition Report' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: ReportType, default: 'CUSTOM' })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiProperty({ enum: ReportFormat, default: 'PDF' })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiProperty({ 
    example: { 
      totalCalories: 1500, 
      avgProtein: 120,
      avgCarbs: 200,
      avgFats: 50
    }
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ example: 'client_id_123', required: false })
  @IsOptional()
  @IsString()
  clientId?: string;
}
