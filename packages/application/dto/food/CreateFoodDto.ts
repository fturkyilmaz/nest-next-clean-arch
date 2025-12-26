import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { FoodCategory } from '@domain/entities/FoodItem.entity';

export class CreateFoodDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(FoodCategory)
    category: FoodCategory;

    @IsNumber()
    servingSize: number;

    @IsString()
    servingUnit: string;

    @IsNumber()
    calories: number;

    @IsNumber()
    protein: number;

    @IsNumber()
    carbs: number;

    @IsNumber()
    fat: number;

    @IsOptional()
    @IsNumber()
    fiber?: number;

    @IsOptional()
    @IsNumber()
    sugar?: number;

    @IsOptional()
    @IsNumber()
    sodium?: number;
}
