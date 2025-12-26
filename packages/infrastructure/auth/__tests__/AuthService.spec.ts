import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService, LoginResult, ValidatedUser } from '../AuthService';
import { IJwtService } from '@application/interfaces/services/IJwtService';
import { IUserRepository } from '@application/interfaces/repositories/common/IUserRepository';
import { User, UserRole } from '@domain/entities/User.entity';
import { Email, Password } from '@domain/value-objects';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtAuthService: any;
  let mockConfigService: any;

  const mockUser = {
    getId: jest.fn().mockReturnValue('user-123'),
    getEmail: jest.fn().mockReturnValue({ getValue: () => 'test@example.com' }),
    getPassword: jest.fn().mockReturnValue({ getValue: () => '$2b$10$hash' }),
    getRole: jest.fn().mockReturnValue('USER'),
    getFirstName: jest.fn().mockReturnValue('John'),
    getLastName: jest.fn().mockReturnValue('Doe'),
    isActive: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    mockJwtAuthService = {
      generateTokens: jest.fn().mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      }),
      verifyRefreshToken: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: any = {
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '1h',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'IJwtService',
          useValue: mockJwtAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER' as UserRole,
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
        },
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockJwtAuthService.generateTokens).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue(mockUser);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should generate JWT tokens after successful registration', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue(mockUser);

      await service.register(registerDto);

      expect(mockJwtAuthService.generateTokens).toHaveBeenCalled();
      const payload = mockJwtAuthService.generateTokens.mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          sub: 'user-123',
          email: 'test@example.com',
          role: 'USER',
        }),
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(email, password);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
        },
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, '$2b$10$hash');
      expect(mockJwtAuthService.generateTokens).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login('invalid@test.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with incorrect password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: jest.fn().mockReturnValue(false) };
      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should verify password using bcrypt.compare', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(email, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, '$2b$10$hash');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'refresh-token';

      mockJwtAuthService.verifyRefreshToken.mockReturnValue({
        sub: 'user-123',
      });
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });

      expect(mockJwtAuthService.verifyRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockJwtAuthService.generateTokens).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      mockJwtAuthService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: jest.fn().mockReturnValue(false) };

      mockJwtAuthService.verifyRefreshToken.mockReturnValue({
        sub: 'user-123',
      });
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      await expect(service.refreshToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle TokenExpiredError', async () => {
      const error = new Error('Token expired');
      (error as any).name = 'TokenExpiredError';

      mockJwtAuthService.verifyRefreshToken.mockImplementation(() => {
        throw error;
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate new tokens with correct payload', async () => {
      mockJwtAuthService.verifyRefreshToken.mockReturnValue({
        sub: 'user-123',
      });
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await service.refreshToken('refresh-token');

      const payload = mockJwtAuthService.generateTokens.mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          sub: 'user-123',
          email: 'test@example.com',
          role: 'USER',
        }),
      );
    });
  });

  describe('validateUser', () => {
    it('should validate and return active user', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-123');

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.validateUser('non-existent');

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: jest.fn().mockReturnValue(false) };
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      const result = await service.validateUser('user-123');

      expect(result).toBeNull();
    });

    it('should return correct ValidatedUser shape', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-123');

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
    });
  });
});
