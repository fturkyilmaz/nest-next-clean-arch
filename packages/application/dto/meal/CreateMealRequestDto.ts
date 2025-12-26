import { ApiProperty } from '@nestjs/swagger';
import { TimeOfDay } from '@shared/types';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';


export class CreateMealRequestDto {
    @ApiProperty({ description: 'Meal plan ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsString()
    mealPlanId: string;

    @ApiProperty({ description: 'Meal name', example: 'Breakfast' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Time of day', enum: TimeOfDay, example: TimeOfDay.BREAKFAST })
    @IsEnum(TimeOfDay)
    timeOfDay: TimeOfDay;

    @ApiProperty({ description: 'Description of the meal', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Instructions for preparing the meal', required: false })
    @IsOptional()
    @IsString()
    instructions?: string;

    @ApiProperty({ description: 'Calories count', required: false, example: 450 })
    @IsOptional()
    @IsNumber()
    calories?: number;

    @ApiProperty({ description: 'Protein amount (grams)', required: false, example: 30 })
    @IsOptional()
    @IsNumber()
    protein?: number;

    @ApiProperty({ description: 'Carbohydrates amount (grams)', required: false, example: 50 })
    @IsOptional()
    @IsNumber()
    carbs?: number;

    @ApiProperty({ description: 'Fat amount (grams)', required: false, example: 20 })
    @IsOptional()
    @IsNumber()
    fat?: number;

    @ApiProperty({ description: 'Fiber amount (grams)', required: false, example: 10 })
    @IsOptional()
    @IsNumber()
    fiber?: number;
}
