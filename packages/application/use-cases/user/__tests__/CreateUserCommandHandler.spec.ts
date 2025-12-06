import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserCommandHandler } from '@application/use-cases/user/commands/CreateUserCommandHandler';
import { CreateUserCommand } from '@application/use-cases/user/commands/CreateUserCommand';

describe('CreateUserCommandHandler', () => {
  let handler: CreateUserCommandHandler;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      existsByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserCommandHandler,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateUserCommandHandler>(CreateUserCommandHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new user successfully', async () => {
      const command = new CreateUserCommand(
        'test@example.com',
        'Password123!',
        'John',
        'Doe',
        'DIETITIAN'
      );

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({
        getId: () => '123',
        getEmail: () => ({ getValue: () => 'test@example.com' }),
        getFirstName: () => 'John',
        getLastName: () => 'Doe',
        getRole: () => 'DIETITIAN',
      });

      const result = await handler.execute(command);

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result.getId()).toBe('123');
    });

    it('should throw error if email already exists', async () => {
      const command = new CreateUserCommand(
        'existing@example.com',
        'Password123!',
        'John',
        'Doe',
        'DIETITIAN'
      );

      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(handler.execute(command)).rejects.toThrow(
        'User with email existing@example.com already exists'
      );
    });
  });
});
