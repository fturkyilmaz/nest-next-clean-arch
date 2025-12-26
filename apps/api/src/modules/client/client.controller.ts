import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  Roles,
  CurrentUser,
  CurrentUserData,
} from '@infrastructure/auth';

import {
  CreateClientCommand,
  UpdateClientCommand,
  GetClientsByIdQuery,
  SearchClientsQuery,
} from '@application/use-cases/client';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientResponseDto,
} from '@application/dto/ClientDto';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @Roles('ADMIN', 'DIETITIAN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Dietitian role required',
  })
  async createClient(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ClientResponseDto> {
    const dietitianId =
      currentUser.role === 'DIETITIAN'
        ? currentUser.id
        : createClientDto.dietitianId;

    const command = new CreateClientCommand(
      createClientDto.firstName,
      createClientDto.lastName,
      createClientDto.email,
      dietitianId,
      createClientDto.phone,
      createClientDto.dateOfBirth
        ? new Date(createClientDto.dateOfBirth)
        : undefined,
      createClientDto.gender,
      createClientDto.allergies,
      createClientDto.conditions,
      createClientDto.medications,
      createClientDto.notes,
    );

    const client = await this.commandBus.execute(command);
    return client;
  }

  @Get()
  @Roles('ADMIN', 'DIETITIAN')
  @ApiOperation({
    summary: 'Get all clients (filtered by dietitian for non-admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Clients retrieved',
    type: [ClientResponseDto],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getClients(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('isActive') isActive?: boolean,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
  ): Promise<ClientResponseDto[]> {
    const dietitianId =
      currentUser.role === 'DIETITIAN' ? currentUser.id : undefined;

    const query = new GetClientsByIdQuery(
      dietitianId || '',
      isActive,
      skip,
      take,
    );

    const clients = await this.queryBus.execute(query);
    return clients;
  }

  @Get('search')
  @Roles('ADMIN', 'DIETITIAN')
  @ApiOperation({ summary: 'Search clients by name or email' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [ClientResponseDto],
  })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async searchClients(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('q') searchTerm: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
  ): Promise<ClientResponseDto[]> {
    const dietitianId =
      currentUser.role === 'DIETITIAN' ? currentUser.id : undefined;

    const query = new SearchClientsQuery(searchTerm, dietitianId, skip, take);
    const clients = await this.queryBus.execute(query);

    return clients;
  }

  @Get(':id')
  @Roles('ADMIN', 'DIETITIAN')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({
    status: 200,
    description: 'Client found',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getClientById(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ClientResponseDto> {
    const client = await this.queryBus.execute(new GetClientsByIdQuery(id));

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (
      currentUser.role === 'DIETITIAN' &&
      client.getDietitianId() !== currentUser.id
    ) {
      throw new ForbiddenException('You do not have access to this client');
    }

    return client;
  }

  @Put(':id')
  @Roles('ADMIN', 'DIETITIAN')
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({
    status: 200,
    description: 'Client updated',
    type: ClientResponseDto,
  })
  async updateClient(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ClientResponseDto> {
    const existingClient = await this.queryBus.execute(
      new GetClientsByIdQuery(id),
    );

    if (!existingClient) {
      throw new NotFoundException('Client not found');
    }

    if (
      currentUser.role === 'DIETITIAN' &&
      existingClient.getDietitianId() !== currentUser.id
    ) {
      throw new ForbiddenException('You do not have access to this client');
    }

    const command = new UpdateClientCommand(
      id,
      {
        firstName: updateClientDto.firstName,
        lastName: updateClientDto.lastName,
        phone: updateClientDto.phone,
        dateOfBirth: updateClientDto.dateOfBirth ? new Date(updateClientDto.dateOfBirth) : undefined,
        gender: updateClientDto.gender,
        allergies: updateClientDto.allergies,
        conditions: updateClientDto.conditions,
        medications: updateClientDto.medications,
        notes: updateClientDto.notes,
      },
    );

    const client = await this.commandBus.execute(command);
    return client;
  }
}
