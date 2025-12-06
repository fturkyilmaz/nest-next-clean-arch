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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, CurrentUser, CurrentUserData } from '@infrastructure/auth';
import { RolesGuard } from '@infrastructure/auth/RolesGuard';
import {
  CreateDietPlanCommand,
  ActivateDietPlanCommand,
  GetDietPlansByClientQuery,
} from '@application/use-cases/diet-plan';
import {
  CreateDietPlanDto,
  UpdateDietPlanDto,
  DietPlanResponseDto,
} from '@application/dto/DietPlanDto';

@ApiTags('Diet Plans')
@Controller('diet-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DietPlanController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @Roles('ADMIN', 'DIETITIAN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new diet plan' })
  @ApiResponse({
    status: 201,
    description: 'Diet plan created successfully',
    type: DietPlanResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Dietitian role required' })
  async createDietPlan(
    @Body() createDietPlanDto: CreateDietPlanDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<DietPlanResponseDto> {
    // If user is dietitian, set dietitianId to current user
    const dietitianId =
      currentUser.role === 'DIETITIAN' ? currentUser.userId : currentUser.userId;

    const command = new CreateDietPlanCommand(
      createDietPlanDto.name,
      createDietPlanDto.clientId,
      dietitianId,
      new Date(createDietPlanDto.startDate),
      createDietPlanDto.description,
      createDietPlanDto.endDate ? new Date(createDietPlanDto.endDate) : undefined,
      createDietPlanDto.nutritionalGoals
    );

    const dietPlan = await this.commandBus.execute(command);

    return this.toResponseDto(dietPlan);
  }

  @Get('client/:clientId')
  @Roles('ADMIN', 'DIETITIAN')
  @ApiOperation({ summary: 'Get all diet plans for a client' })
  @ApiResponse({ status: 200, description: 'Diet plans retrieved', type: [DietPlanResponseDto] })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getDietPlansByClient(
    @Param('clientId') clientId: string,
    @CurrentUser() currentUser: CurrentUserData,
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean,
    @Query('skip') skip?: number,
    @Query('take') take?: number
  ): Promise<DietPlanResponseDto[]> {
    // TODO: Verify that dietitian has access to this client
    // For now, we'll allow access

    const query = new GetDietPlansByClientQuery(clientId, status, isActive, skip, take);
    const dietPlans = await this.queryBus.execute(query);

    return dietPlans.map((plan) => this.toResponseDto(plan));
  }

  @Put(':id/activate')
  @Roles('ADMIN', 'DIETITIAN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a diet plan' })
  @ApiResponse({ status: 200, description: 'Diet plan activated', type: DietPlanResponseDto })
  async activateDietPlan(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<DietPlanResponseDto> {
    // TODO: Verify that dietitian owns this diet plan

    const command = new ActivateDietPlanCommand(id);
    const dietPlan = await this.commandBus.execute(command);

    return this.toResponseDto(dietPlan);
  }

  private toResponseDto(dietPlan: any): DietPlanResponseDto {
    return {
      id: dietPlan.getId(),
      name: dietPlan.getName(),
      description: dietPlan.getDescription(),
      clientId: dietPlan.getClientId(),
      dietitianId: dietPlan.getDietitianId(),
      startDate: dietPlan.getDateRange().getStartDate(),
      endDate: dietPlan.getDateRange().getEndDate(),
      status: dietPlan.getStatus(),
      nutritionalGoals: dietPlan.getNutritionalGoals(),
      version: dietPlan.getVersion(),
      isActive: dietPlan.isActive(),
      createdAt: dietPlan.getCreatedAt(),
      updatedAt: dietPlan.getUpdatedAt(),
    };
  }
}
