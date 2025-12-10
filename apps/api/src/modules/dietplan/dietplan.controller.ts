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

@ApiTags('Diet Plans')
@Controller('diet-plans')
@UseGuards(JwtAuthGuard)
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
  @ApiCreatedResponse({ description: 'Diet plan created successfully', type: DietPlanResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin or Dietitian role required' })
  async createDietPlan(
    @Body() dto: CreateDietPlanDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<DietPlanResponseDto> {
    const dietitianId =
      currentUser.role === 'DIETITIAN' ? currentUser.userId : dto.dietitianId;

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
    return this.mapToResponse(dietPlan);
  }

  @Get('client/:clientId')
  @Roles('ADMIN', 'DIETITIAN')
  @ApiOperation({ summary: 'Get all diet plans for a client' })
  @ApiOkResponse({ description: 'Diet plans retrieved', type: [DietPlanResponseDto] })
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
    const query = new GetDietPlansByClientQuery(clientId, status, isActive, skip, take);
    const dietPlans = await this.queryBus.execute(query);

    return dietPlans.map(this.mapToResponse);
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
    // TODO: Verify that dietitian owns this diet plan
    const command = new ActivateDietPlanCommand(id);
    const dietPlan = await this.commandBus.execute(command);

    return this.mapToResponse(dietPlan);
  }

  /** Helper mapper function */
  private mapToResponse(dietPlan: any): DietPlanResponseDto {
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
