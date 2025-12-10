import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserCommandHandler } from '@application/use-cases/user/commands/CreateUserCommandHandler';
import { CreateUserCommand } from '@application/use-cases/user/commands/CreateUserCommand';


jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('uuid-123')
}));

describe('CreateUserCommandHandler', () => {
  let handler: CreateUserCommandHandler;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserCommandHandler,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'IPasswordHasher',
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn().mockResolvedValue(true),
          },
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

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        getId: () => '123',
        getEmail: () => ({ getValue: () => 'test@example.com' }),
        getFirstName: () => 'John',
        getLastName: () => 'Doe',
        getRole: () => 'DIETITIAN',
      });

      const result = await handler.execute(command);


      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result.isSuccess).toBeTruthy();
      expect(result.getValue().getId()).toBe('123');
    });

    it('should throw error if email already exists', async () => {
      const command = new CreateUserCommand(
        'existing@example.com',
        'Password123!',
        'John',
        'Doe',
        'DIETITIAN'
      );

      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-123' });

      const result = await handler.execute(command);

      expect(result.isFailure).toBeTruthy();
      expect(result.getError().toString()).toContain('User with email existing@example.com already exists');
    });
  });
});
