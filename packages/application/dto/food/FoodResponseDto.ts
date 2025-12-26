import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class FoodResponseDto {
  @ApiProperty({ example: 'Sleek Bamboo Pants' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Discover the peacock-like agility...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'SNACKS' })
  @IsString()
  category: string;

  @ApiProperty({ example: 240.9 })
  @IsNumber()
  servingSize: number;

  @ApiProperty({ example: 'grams' })
  @IsString()
  servingUnit: string;

  @ApiProperty({ example: 373.6 })
  @IsNumber()
  calories: number;

  @ApiProperty({ example: 20.3 })
  @IsNumber()
  protein: number;

  @ApiProperty({ example: 107.6 })
  @IsNumber()
  carbs: number;

  @ApiProperty({ example: 26.6 })
  @IsNumber()
  fat: number;

  @ApiProperty({ example: 8.9, required: false })
  @IsNumber()
  @IsOptional()
  fiber?: number;

  @ApiProperty({ example: 4.9, required: false })
  @IsNumber()
  @IsOptional()
  sugar?: number;

  @ApiProperty({ example: 149, required: false })
  @IsNumber()
  @IsOptional()
  sodium?: number;
}