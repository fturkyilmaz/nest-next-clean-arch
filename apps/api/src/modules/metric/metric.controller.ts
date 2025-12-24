import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMetricCommand } from '@application/use-cases/metric/CreateMetricUseCase';
import { GetAllMetricQuery } from '@application/use-cases/metric/GetAllMetricUseCase';
import { GetMetricByIdQuery } from '@application/use-cases/metric/GetMetricByIdUseCase';

@ApiTags('Metric')
@Controller('metrics')
export class MetricController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all metrics' })
  @ApiResponse({ status: 200, description: 'List returned' })
  async findAll() {
    return this.queryBus.execute(new GetAllMetricQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get metric by id' })
  @ApiResponse({ status: 200, description: 'Item returned' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetMetricByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create metric' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async create(@Body() dto: any) {
    return this.commandBus.execute(new CreateMetricCommand(dto));
  }
}
