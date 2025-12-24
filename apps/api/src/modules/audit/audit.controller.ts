import { Controller, Get } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audits')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
