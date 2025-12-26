import { TimeOfDay } from '@domain/entities';
import { ApiProperty } from '@nestjs/swagger';

export class MealResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the meal',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Meal plan ID this meal belongs to',
        example: '987e6543-e21b-12d3-a456-426614174999',
    })
    mealPlanId: string;

    @ApiProperty({ description: 'Meal name', example: 'Breakfast' })
    name: string;

    @ApiProperty({
        description: 'Time of day when the meal is scheduled',
        enum: TimeOfDay,
        example: 'BREAKFAST',
    })
    timeOfDay: TimeOfDay;

    @ApiProperty({
        description: 'Description of the meal',
        required: false,
        example: 'High protein breakfast with eggs and oats',
    })
    description?: string;

    @ApiProperty({
        description: 'Preparation or serving instructions',
        required: false,
        example: 'Serve with a glass of milk',
    })
    instructions?: string;

    @ApiProperty({ description: 'Calories count', required: false, example: 450 })
    calories?: number;

    @ApiProperty({ description: 'Protein amount (grams)', required: false, example: 30 })
    protein?: number;

    @ApiProperty({ description: 'Carbohydrates amount (grams)', required: false, example: 50 })
    carbs?: number;

    @ApiProperty({ description: 'Fat amount (grams)', required: false, example: 20 })
    fat?: number;

    @ApiProperty({ description: 'Fiber amount (grams)', required: false, example: 10 })
    fiber?: number;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2025-12-26T08:30:00Z',
    })
    createdAt: string;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2025-12-26T09:00:00Z',
    })
    updatedAt: string;
}
