import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAppointmentCommand } from '@application/use-cases/appointment/CreateAppointmentUseCase';
import { GetAllAppointmentQuery } from '@application/use-cases/appointment/GetAllAppointmentUseCase';
import { GetAppointmentByIdQuery } from '@application/use-cases/appointment/GetAppointmentByIdUseCase';

@ApiTags('Appointment')
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'List returned' })
  async findAll() {
    return this.queryBus.execute(new GetAllAppointmentQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by id' })
  @ApiResponse({ status: 200, description: 'Item returned' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetAppointmentByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create appointment' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async create(@Body() dto: any) {
    return this.commandBus.execute(new CreateAppointmentCommand(dto));
  }
}
