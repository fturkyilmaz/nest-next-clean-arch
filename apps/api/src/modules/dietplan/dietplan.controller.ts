// dietplan.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DietPlanService } from './dietplan.service';

@Controller('api/v1/dietplans')
export class DietPlanController {
  constructor(private readonly service: DietPlanService) { }

  @Get(':clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.service.findByClient(clientId);
  }

  @Post()
  async create(@Body() dto: { clientId: string; dietitianId: string; meals: any[] }) {
    return this.service.create(dto);
  }
}
