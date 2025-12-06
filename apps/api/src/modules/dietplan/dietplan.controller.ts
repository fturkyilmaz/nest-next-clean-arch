import { Controller, Get, Post, Body } from '@nestjs/common';
import { DietPlanService } from './dietplan.service';

@Controller('api/v1/dietplans')
export class DietPlanController {
  constructor(private readonly service: DietPlanService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: { clientId: string; meals: any[] }) {
    return this.service.create(dto);
  }
}
