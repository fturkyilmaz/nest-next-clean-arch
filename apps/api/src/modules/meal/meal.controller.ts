import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMealCommand } from '@application/use-cases/meal/CreateMealUseCase';
import { GetAllMealQuery } from '@application/use-cases/meal/GetAllMealUseCase';
import { GetMealByIdQuery } from '@application/use-cases/meal/GetMealByIdUseCase';

@ApiTags('Meal')
@Controller('meals')
export class MealController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all meals' })
  @ApiResponse({ status: 200, description: 'List returned' })
  async findAll() {
    return this.queryBus.execute(new GetAllMealQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal by id' })
  @ApiResponse({ status: 200, description: 'Item returned' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetMealByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create meal' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async create(@Body() dto: any) {
    return this.commandBus.execute(new CreateMealCommand(dto));
  }
}
