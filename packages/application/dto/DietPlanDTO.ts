import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DietPlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class NutritionalGoalsDto {
  @ApiPropertyOptional({ example: 2000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetCalories?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetProtein?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetCarbs?: number;

  @ApiPropertyOptional({ example: 65 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetFat?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetFiber?: number;
}

export class CreateDietPlanDto {
  @ApiProperty({ example: 'Weight Management Plan' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Balanced diet plan for healthy weight loss' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'client-id-123' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-03-01' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: DietPlanStatus, example: DietPlanStatus.DRAFT })
  @IsEnum(DietPlanStatus)
  @IsOptional()
  status?: DietPlanStatus;

  @ApiPropertyOptional({ type: NutritionalGoalsDto })
  @IsOptional()
  nutritionalGoals?: NutritionalGoalsDto;
}

export class UpdateDietPlanDto {
  @ApiPropertyOptional({ example: 'Weight Management Plan' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Balanced diet plan for healthy weight loss' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-03-01' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: DietPlanStatus, example: DietPlanStatus.ACTIVE })
  @IsEnum(DietPlanStatus)
  @IsOptional()
  status?: DietPlanStatus;

  @ApiPropertyOptional({ type: NutritionalGoalsDto })
  @IsOptional()
  nutritionalGoals?: NutritionalGoalsDto;
}

export class DietPlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  dietitianId: string;

  @ApiProperty()
  startDate: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiProperty({ enum: DietPlanStatus })
  status: DietPlanStatus;

  @ApiPropertyOptional({ type: NutritionalGoalsDto })
  nutritionalGoals?: NutritionalGoalsDto;

  @ApiProperty()
  version: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
