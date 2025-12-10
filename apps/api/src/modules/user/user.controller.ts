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
  NotFoundException,
  ForbiddenException,
  ParseBoolPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, CurrentUser, CurrentUserData } from '@infrastructure/auth';
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
import { UserMapper } from './user.mapper';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
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
  @ApiCreatedResponse({ description: 'User created successfully', type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.password,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.role
    );

    const user = await this.commandBus.execute(command);
    return UserMapper.toResponseDto(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({ description: 'User found', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const query = new GetUserByIdQuery(id);
    const user = await this.queryBus.execute(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toResponseDto(user);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiOkResponse({ description: 'Users retrieved', type: [UserResponseDto] })
  async getAllUsers(
    @Query('role') role?: string,
    @Query('isActive', ParseBoolPipe) isActive?: boolean,
    @Query('skip', ParseIntPipe) skip?: number,
    @Query('take', ParseIntPipe) take?: number
  ): Promise<UserResponseDto[]> {
    const query = new GetAllUsersQuery(role, isActive, skip, take);
    const users = await this.queryBus.execute(query);

    return users.map(UserMapper.toResponseDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ description: 'User updated', type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden - You can only update your own profile' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserData
  ): Promise<UserResponseDto> {
    if (currentUser.userId !== id && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own profile');
    }

    const command = new UpdateUserCommand(
      id,
      updateUserDto.email,
      updateUserDto.firstName,
      updateUserDto.lastName
    );

    const user = await this.commandBus.execute(command);
    return UserMapper.toResponseDto(user);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Current user profile', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getCurrentUser(@CurrentUser() currentUser: CurrentUserData): Promise<UserResponseDto> {
    const query = new GetUserByIdQuery(currentUser.userId);
    const user = await this.queryBus.execute(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toResponseDto(user);
  }
}
