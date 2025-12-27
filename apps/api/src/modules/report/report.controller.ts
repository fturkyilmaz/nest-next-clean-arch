import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateReportCommand } from '@application/use-cases/report/CreateReportUseCase';
import { GetAllReportQuery } from '@application/use-cases/report/GetAllReportUseCase';
import { GetReportByIdQuery } from '@application/use-cases/report/GetReportByIdUseCase';
import { CreateReportDto } from './dto/CreateReportDto';
import { UpdateReportDto } from './dto/UpdateReportDto';
import { ReportResponseDto } from './dto/ReportResponseDto';

@ApiTags('Report')
@Controller('reports')
export class ReportController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, description: 'List of reports', type: [ReportResponseDto] })
  async findAll(): Promise<ReportResponseDto[]> {
    return this.queryBus.execute(new GetAllReportQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by id' })
  @ApiResponse({ status: 200, description: 'Report details', type: ReportResponseDto })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(@Param('id') id: string): Promise<ReportResponseDto> {
    return this.queryBus.execute(new GetReportByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create report' })
  @ApiResponse({ status: 201, description: 'Report created successfully', type: ReportResponseDto })
  async create(@Body() dto: CreateReportDto): Promise<ReportResponseDto> {
    return this.commandBus.execute(new CreateReportCommand(dto));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully', type: ReportResponseDto })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateReportDto): Promise<ReportResponseDto> {
    return this.commandBus.execute(new CreateReportCommand({ ...dto, id }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 204, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CreateReportCommand({ id }));
  }
}
