// client.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller('api/v1/clients')
export class ClientController {
  constructor(private readonly service: ClientService) { }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() dto: { name: string; dietitianId: string }) {
    return this.service.create(dto);
  }
}
