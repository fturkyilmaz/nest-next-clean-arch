import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFoodCommand } from '@application/use-cases/food/CreateFoodUseCase';
import { GetAllFoodQuery } from '@application/use-cases/food/GetAllFoodUseCase';
import { GetFoodByIdQuery } from '@application/use-cases/food/GetFoodByIdUseCase';

@ApiTags('Food')
@Controller('foods')
export class FoodController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all foods' })
  @ApiResponse({ status: 200, description: 'List returned' })
  async findAll() {
    return this.queryBus.execute(new GetAllFoodQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get food by id' })
  @ApiResponse({ status: 200, description: 'Item returned' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetFoodByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create food' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async create(@Body() dto: any) {
    return this.commandBus.execute(new CreateFoodCommand(dto));
  }
}
