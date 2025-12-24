import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../JwtAuthGuard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockContext: ExecutionContext;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    mockContext = {
      switchToHttp: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleRequest', () => {
    it('should return user if no error and user exists', () => {
      const user = { id: 'user-123', email: 'test@example.com' };

      const result = guard.handleRequest(null, user, null, mockContext);

      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if error provided', () => {
      const error = new Error('JWT validation failed');

      expect(() => guard.handleRequest(error, null, null, mockContext)).toThrow(
        error,
      );
    });

    it('should throw UnauthorizedException if user is null', () => {
      expect(() => guard.handleRequest(null, null, null, mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is undefined', () => {
      expect(() => guard.handleRequest(null, undefined, null, mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw default message when no user and no error', () => {
      expect(() => guard.handleRequest(null, null, null, mockContext)).toThrow(
        'Invalid or missing JWT token',
      );
    });

    it('should throw error in preference to default message', () => {
      const specificError = new UnauthorizedException('Token expired');

      expect(() => guard.handleRequest(specificError, null, null, mockContext)).toThrow(
        'Token expired',
      );
    });

    it('should handle info parameter (Passport strategy info)', () => {
      const user = { id: 'user-123' };
      const info = { message: 'Unauthorized' };

      const result = guard.handleRequest(null, user, info, mockContext);

      expect(result).toEqual(user);
    });
  });
});
