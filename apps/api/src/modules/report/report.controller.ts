import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateReportCommand } from '@application/use-cases/report/CreateReportUseCase';
import { GetAllReportQuery } from '@application/use-cases/report/GetAllReportUseCase';
import { GetReportByIdQuery } from '@application/use-cases/report/GetReportByIdUseCase';

@ApiTags('Report')
@Controller('reports')
export class ReportController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, description: 'List returned' })
  async findAll() {
    return this.queryBus.execute(new GetAllReportQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by id' })
  @ApiResponse({ status: 200, description: 'Item returned' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetReportByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create report' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async create(@Body() dto: any) {
    return this.commandBus.execute(new CreateReportCommand(dto));
  }
}
