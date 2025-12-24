import { Controller, Get, Post, Body } from '@nestjs/common';
import { FoodService } from './food.service';

@Controller('foods')
export class FoodController {
  constructor(private readonly service: FoodService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }
}
