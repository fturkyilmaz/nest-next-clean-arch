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

export class UpdateReportDto {
  @ApiProperty({ example: 'Q4 Nutrition Report', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ enum: ReportType, required: false })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiProperty({ enum: ReportFormat, required: false })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiProperty({ 
    example: { 
      totalCalories: 1500, 
      avgProtein: 120,
      avgCarbs: 200,
      avgFats: 50
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
