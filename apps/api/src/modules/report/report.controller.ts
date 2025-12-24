import { Controller, Get } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Get()
  generate() {
    return this.service.generate();
  }
}
