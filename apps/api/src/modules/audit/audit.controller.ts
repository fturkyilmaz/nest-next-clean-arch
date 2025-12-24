import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAuditCommand } from '@application/use-cases/audit/CreateAuditUseCase';
import { GetAllAuditQuery } from '@application/use-cases/audit/GetAllAuditUseCase';
import { GetAuditByIdQuery } from '@application/use-cases/audit/GetAuditByIdUseCase';

@ApiTags('Audit')
@Controller('audits')
export class AuditController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all audits' })
  @ApiResponse({ status: 200, description: 'List returned' })
  async findAll() {
    return this.queryBus.execute(new GetAllAuditQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit by id' })
  @ApiResponse({ status: 200, description: 'Item returned' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetAuditByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create audit' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async create(@Body() dto: any) {
    return this.commandBus.execute(new CreateAuditCommand(dto));
  }
}
