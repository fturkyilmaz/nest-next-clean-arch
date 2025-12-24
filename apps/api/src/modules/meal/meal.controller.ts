import { Controller, Get, Post, Body } from '@nestjs/common';
import { MealService } from './meal.service';

@Controller('meals')
export class MealController {
  constructor(private readonly service: MealService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }
}
