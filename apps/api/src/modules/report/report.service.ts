import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReportRepository } from '@domain/repositories/IReportRepository';
import { CreateReportDto } from './dto/CreateReportDto';
import { UpdateReportDto } from './dto/UpdateReportDto';
import { ReportResponseDto } from './dto/ReportResponseDto';

@Injectable()
export class ReportService {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
  ) {}

  async findAll(): Promise<ReportResponseDto[]> {
    const reports = await this.reportRepository.findAll();
    return reports.map(this.toResponseDto);
  }

  async findById(id: string): Promise<ReportResponseDto> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with id ${id} not found`);
    }
    return this.toResponseDto(report);
  }

  async create(dto: CreateReportDto): Promise<ReportResponseDto> {
    const report = await this.reportRepository.create({
      title: dto.title,
      type: dto.type || 'CUSTOM',
      format: dto.format || 'PDF',
      data: dto.data || {},
      clientId: dto.clientId,
    });
    return this.toResponseDto(report);
  }

  async update(id: string, dto: UpdateReportDto): Promise<ReportResponseDto> {
    const existingReport = await this.reportRepository.findById(id);
    if (!existingReport) {
      throw new NotFoundException(`Report with id ${id} not found`);
    }

    const report = await this.reportRepository.update(id, {
      title: dto.title || existingReport.title,
      type: dto.type || existingReport.type,
      format: dto.format || existingReport.format,
      data: dto.data || existingReport.data,
    });
    return this.toResponseDto(report);
  }

  async delete(id: string): Promise<void> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with id ${id} not found`);
    }
    await this.reportRepository.delete(id);
  }

  private toResponseDto(report: any): ReportResponseDto {
    return {
      id: report.id,
      title: report.title,
      type: report.type,
      format: report.format,
      data: report.data || {},
      clientId: report.clientId,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      deletedAt: report.deletedAt,
    };
  }
}
