import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'; // ApiParam ekledik
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFoodCommand } from '@application/use-cases/food/CreateFoodUseCase';
import { GetAllFoodQuery } from '@application/use-cases/food/GetAllFoodUseCase';
import { GetFoodByIdQuery } from '@application/use-cases/food/GetFoodByIdUseCase';
import { CreateFoodDto } from '@application/dto/food/CreateFoodDto';
import { FoodResponseDto } from '@application/dto/food/FoodResponseDto';

@ApiTags('Foods')
@Controller('foods')
export class FoodController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) { }

  @Get()
  @ApiOperation({ summary: 'Get all foods' })
  @ApiResponse({ 
    status: 200, 
    description: 'List returned', 
    type: FoodResponseDto, 
    isArray: true 
  })
  async findAll() {
    return this.queryBus.execute(new GetAllFoodQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get food by id' })
  @ApiParam({ name: 'id', description: 'ID of the food', type: String }) // Orval hatasını önler
  @ApiResponse({ 
    status: 200, 
    description: 'Item returned', 
    type: FoodResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Food not found' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetFoodByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create food' })
  @ApiResponse({ 
    status: 201, 
    description: 'Created successfully', 
    type: FoodResponseDto
  })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  async create(@Body() dto: CreateFoodDto) {
    return this.commandBus.execute(new CreateFoodCommand(dto));
  }
}