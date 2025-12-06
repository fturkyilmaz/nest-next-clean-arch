import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientMetricsDto {
  @ApiProperty({ example: 'client-id-123' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: 75.5, description: 'Weight in kilograms' })
  @IsNumber()
  @Min(20)
  @Max(500)
  weight: number;

  @ApiProperty({ example: 175, description: 'Height in centimeters' })
  @IsNumber()
  @Min(50)
  @Max(300)
  height: number;

  @ApiPropertyOptional({ example: 22.5, description: 'Body fat percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  bodyFat?: number;

  @ApiPropertyOptional({ example: 85, description: 'Waist circumference in cm' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  waist?: number;

  @ApiPropertyOptional({ example: 95, description: 'Hip circumference in cm' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  hip?: number;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @ApiPropertyOptional({ example: 'Measured after morning workout' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ClientMetricsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  bmi: number;

  @ApiPropertyOptional()
  bodyFat?: number;

  @ApiPropertyOptional()
  waist?: number;

  @ApiPropertyOptional()
  hip?: number;

  @ApiPropertyOptional()
  waistToHipRatio?: number;

  @ApiProperty()
  recordedAt: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;
}
