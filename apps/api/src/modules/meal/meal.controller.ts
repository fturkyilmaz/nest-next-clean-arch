import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMealCommand } from '@application/use-cases/meal/CreateMealUseCase';
import { GetAllMealQuery } from '@application/use-cases/meal/GetAllMealUseCase';
import { GetMealByIdQuery } from '@application/use-cases/meal/GetMealByIdUseCase';
import { CreateMealRequestDto } from '@application/dto/meal/CreateMealRequestDto';
import { TimeOfDay } from '@domain/value-objects/TimeOfDay.vo';
import { MealResponseDto } from '@application/dto/meal/MealResponseDto';

@ApiTags('Meal')
@Controller('meals')
export class MealController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) { }

  @Get()
  @ApiOperation({ summary: 'Get all meals' })
  @ApiResponse({ status: 200, description: 'List returned', type: [MealResponseDto] })
  async findAll() {
    return this.queryBus.execute(new GetAllMealQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal by id' })
  @ApiParam({ name: 'id', type: String, description: 'Meal ID' })
  @ApiResponse({ status: 200, description: 'Item returned', type: MealResponseDto })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetMealByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create meal' })
  @ApiBody({ type: CreateMealRequestDto })
  @ApiResponse({ status: 201, description: 'Created successfully', type: MealResponseDto })
  async create(@Body() dto: CreateMealRequestDto) {
    return this.commandBus.execute(
      new CreateMealCommand(
        dto.mealPlanId,
        dto.name,
        TimeOfDay.fromString(dto.timeOfDay),
        dto.description,
        dto.instructions,
        dto.calories,
        dto.protein,
        dto.carbs,
        dto.fat,
        dto.fiber,
      ),
    );
  }
}
