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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, CurrentUser, CurrentUserData } from '@infrastructure/auth';
import { RolesGuard } from '@infrastructure/auth/RolesGuard';
import {
  CreateUserCommand,
  UpdateUserCommand,
  GetUserByIdQuery,
  GetAllUsersQuery,
} from '@application/use-cases/user';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@application/dto/UserDto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.password,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.role
    );

    const user = await this.commandBus.execute(command);

    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      role: user.getRole(),
      isActive: user.isActive(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const query = new GetUserByIdQuery(id);
    const user = await this.queryBus.execute(query);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      role: user.getRole(),
      isActive: user.isActive(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved', type: [UserResponseDto] })
  async getAllUsers(
    @Query('role') role?: string,
    @Query('isActive') isActive?: boolean,
    @Query('skip') skip?: number,
    @Query('take') take?: number
  ): Promise<UserResponseDto[]> {
    const query = new GetAllUsersQuery(role, isActive, skip, take);
    const users = await this.queryBus.execute(query);

    return users.map((user) => ({
      id: user.getId(),
      email: user.getEmail().getValue(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      role: user.getRole(),
      isActive: user.isActive(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<UserResponseDto> {
    // Users can only update their own profile unless they're admin
    if (currentUser.userId !== id && currentUser.role !== 'ADMIN') {
      throw new Error('Forbidden - You can only update your own profile');
    }

    const command = new UpdateUserCommand(
      id,
      updateUserDto.email,
      updateUserDto.firstName,
      updateUserDto.lastName
    );

    const user = await this.commandBus.execute(command);

    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      role: user.getRole(),
      isActive: user.isActive(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: UserResponseDto })
  async getCurrentUser(@CurrentUser() currentUser: CurrentUserData): Promise<UserResponseDto> {
    const query = new GetUserByIdQuery(currentUser.userId);
    const user = await this.queryBus.execute(query);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      role: user.getRole(),
      isActive: user.isActive(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
