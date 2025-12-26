import { Test } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard, ROLES_KEY } from '../RolesGuard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: any;
  let mockContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    mockRequest = {
      user: { id: 'user-123', role: 'USER' },
    };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    const module = Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).createNestApplication();

    guard = new RolesGuard(mockReflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true if no required roles specified', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['USER']);
      mockRequest.user = { id: 'user-123', role: 'USER' };

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true if user has one of multiple required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MODERATOR']);
      mockRequest.user = { id: 'user-123', role: 'ADMIN' };

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user not authenticated', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['USER']);
      mockRequest.user = undefined;

      expect(() => guard.canActivate(mockContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException with correct message when user not authenticated', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['USER']);
      mockRequest.user = undefined;

      expect(() => guard.canActivate(mockContext)).toThrow(
        'User not authenticated',
      );
    });

    it('should throw ForbiddenException if user does not have required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
      mockRequest.user = { id: 'user-123', role: 'USER' };

      expect(() => guard.canActivate(mockContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should include required roles in error message', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MODERATOR']);
      mockRequest.user = { id: 'user-123', role: 'USER' };

      expect(() => guard.canActivate(mockContext)).toThrow(
        /ADMIN, MODERATOR/,
      );
    });

    it('should get roles from handler and class metadata', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['USER']);

      guard.canActivate(mockContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        ROLES_KEY,
        expect.arrayContaining([mockContext.getHandler(), mockContext.getClass()]),
      );
    });

    it('should work with different role values', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['SUPER_ADMIN']);
      mockRequest.user = { id: 'user-123', role: 'SUPER_ADMIN' };

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should be case-sensitive for role comparison', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['Admin']);
      mockRequest.user = { id: 'user-123', role: 'ADMIN' };

      expect(() => guard.canActivate(mockContext)).toThrow();
    });

    it('should handle empty roles array', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);
      mockRequest.user = { id: 'user-123', role: 'USER' };

      // Empty array means no valid roles, should fail
      expect(() => guard.canActivate(mockContext)).toThrow(
        ForbiddenException,
      );
    });
  });
});
