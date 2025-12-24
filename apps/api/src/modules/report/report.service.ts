import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportService {
  generate() {
    return { summary: 'Report generated successfully', date: new Date() };
  }
}
