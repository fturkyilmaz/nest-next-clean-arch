import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { CreateReportCommand } from '@application/use-cases/report/CreateReportUseCase';
import { GetAllReportQuery } from '@application/use-cases/report/GetAllReportUseCase';
import { GetReportByIdQuery } from '@application/use-cases/report/GetReportByIdUseCase';
import { CreateReportDto } from './dto/CreateReportDto';
import { UpdateReportDto } from './dto/UpdateReportDto';
import { ReportResponseDto } from './dto/ReportResponseDto';
import { ReportService } from './report.service';
import { PDFExporter, ExcelExporter, CSVExporter } from '@infrastructure/exports';

@ApiTags('Report')
@Controller('reports')
export class ReportController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly reportService: ReportService,
  ) {}

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
    return this.commandBus.execute(
      new CreateReportCommand(
        dto.title,
        dto.type,
        dto.format,
        dto.data,
        dto.clientId,
        dto.createdBy,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully', type: ReportResponseDto })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateReportDto): Promise<ReportResponseDto> {
    return this.reportService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 204, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.reportService.delete(id);
  }

  @Get(':id/export/pdf')
  @ApiOperation({ summary: 'Export report as PDF' })
  @ApiResponse({ status: 200, description: 'PDF file' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async exportPDF(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const report = await this.reportService.findById(id);
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    try {
      const pdfBuffer = await PDFExporter.exportJSON(report.data, {
        title: report.title,
      });

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.title}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      return new StreamableFile(pdfBuffer);
    } catch (error) {
      throw new BadRequestException(`Failed to generate PDF: ${error.message}`);
    }
  }

  @Get(':id/export/excel')
  @ApiOperation({ summary: 'Export report as Excel' })
  @ApiResponse({ status: 200, description: 'Excel file' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async exportExcel(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const report = await this.reportService.findById(id);
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    try {
      // Convert report data to array format if it's an object
      const data = Array.isArray(report.data) 
        ? report.data 
        : [report.data];

      const excelBuffer = await ExcelExporter.exportData(data, {
        sheetName: report.type || 'Report',
      });

      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${report.title}.xlsx"`,
        'Content-Length': excelBuffer.length,
      });

      return new StreamableFile(excelBuffer);
    } catch (error) {
      throw new BadRequestException(`Failed to generate Excel: ${error.message}`);
    }
  }

  @Get(':id/export/csv')
  @ApiOperation({ summary: 'Export report as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async exportCSV(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const report = await this.reportService.findById(id);
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    try {
      // Convert report data to array format if it's an object
      const data = Array.isArray(report.data) 
        ? report.data 
        : [report.data];

      const csvBuffer = CSVExporter.exportData(data, {
        includeHeader: true,
      });

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${report.title}.csv"`,
      });

      res.send(csvBuffer);
    } catch (error) {
      throw new BadRequestException(`Failed to generate CSV: ${error.message}`);
    }
  }
}
