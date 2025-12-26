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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, CurrentUser, CurrentUserData } from '@infrastructure/auth';
import {
  CreateDietPlanCommand,
  ActivateDietPlanCommand,
  GetDietPlansByClientQuery,
} from '@application/use-cases/diet-plan';
import { CreateDietPlanDto, DietPlanResponseDto } from '@application/dto/DietPlanDto';
import { GetAllDietPlansQuery } from '@application/use-cases/diet-plan/queries/GetAllDietPlansQuery';
import { PaginatedResponseDto } from '@application/dto/common/PaginatedResponseDto';

@ApiTags('Diet Plans')
@Controller('diet-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DietPlanController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) { }

  @Post()
  @Roles('ADMIN', 'DIETITIAN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new diet plan' })
  @ApiCreatedResponse({ description: 'Diet plan created successfully', type: DietPlanResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin or Dietitian role required' })
  async createDietPlan(
    @Body() dto: CreateDietPlanDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<DietPlanResponseDto> {
    const dietitianId =
      currentUser.role === 'DIETITIAN' ? currentUser.id : dto.clientId;

    const command = new CreateDietPlanCommand(
      dto.name,
      dto.clientId,
      dietitianId,
      new Date(dto.startDate),
      dto.description,
      dto.endDate ? new Date(dto.endDate) : undefined,
      dto.nutritionalGoals
    );

    const dietPlan = await this.commandBus.execute(command);
    return dietPlan;
  }

  @Get('client/:clientId')
  @Roles('ADMIN', 'DIETITIAN')
  @ApiOperation({ summary: 'Get all diet plans for a client' })
  @ApiOkResponse({ description: 'Diet plans retrieved with pagination', type: PaginatedResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getDietPlansByClient(
    @Param('clientId') clientId: string,
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean
  ): Promise<PaginatedResponseDto<DietPlanResponseDto>> {
    const query = new GetDietPlansByClientQuery(clientId, page, limit, status, isActive);
    const paginatedResult = await this.queryBus.execute(query);

    return new PaginatedResponseDto(
      paginatedResult.data.map(plan => plan),
      paginatedResult.page,
      paginatedResult.limit,
      paginatedResult.total
    );
  }

  @Get() @Roles('ADMIN', 'DIETITIAN')
  @ApiOperation({ summary: 'Get all diet plans' })
  @ApiOkResponse({ description: 'All diet plans retrieved with pagination', type: PaginatedResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getAllDietPlans(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean
  ): Promise<PaginatedResponseDto<DietPlanResponseDto>> {
    const query = new GetAllDietPlansQuery(page, limit, status, isActive);
    const paginatedResult = await this.queryBus.execute(query);

    return new PaginatedResponseDto(
      paginatedResult.data.map(plan => plan),
      paginatedResult.page,
      paginatedResult.limit,
      paginatedResult.total
    );
  }

  @Put(':id/activate')
  @Roles('ADMIN', 'DIETITIAN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a diet plan' })
  @ApiOkResponse({ description: 'Diet plan activated', type: DietPlanResponseDto })
  async activateDietPlan(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<DietPlanResponseDto> {
    const command = new ActivateDietPlanCommand(id);
    const dietPlan = await this.commandBus.execute(command);

    return dietPlan
  }
}
