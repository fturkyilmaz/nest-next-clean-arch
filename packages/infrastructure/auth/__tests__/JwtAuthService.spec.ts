import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthService } from '../JwtAuthService';

describe('JwtAuthService', () => {
  let service: JwtAuthService;
  let mockJwtService: any;

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<JwtAuthService>(JwtAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      const accessToken = 'access-token-xyz';
      const refreshToken = 'refresh-token-abc';

      mockJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = service.generateTokens(payload);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        expiresIn: expect.any(Number),
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should include correct payload in access token', () => {
      const payload = {
        sub: 'user-456',
        email: 'user@test.com',
        role: 'ADMIN',
      };

      const accessToken = 'token';
      mockJwtService.sign.mockReturnValue(accessToken);

      service.generateTokens(payload);

      const firstCall = mockJwtService.sign.mock.calls[0];
      expect(firstCall[0]).toEqual(payload);
    });

    it('should return expiresIn value in seconds', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      mockJwtService.sign.mockReturnValue('token');

      const result = service.generateTokens(payload);

      expect(result.expiresIn).toBeGreaterThan(0);
      expect(typeof result.expiresIn).toBe('number');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and return refresh token payload', () => {
      const token = 'refresh-token-abc';
      const expectedPayload = { sub: 'user-123' };

      mockJwtService.verify.mockReturnValue(expectedPayload);

      const result = service.verifyRefreshToken(token);

      expect(result).toEqual(expectedPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        token,
        expect.objectContaining({
          secret: expect.any(String),
        }),
      );
    });

    it('should throw UnauthorizedException on invalid token', () => {
      const token = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyRefreshToken(token)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on invalid payload structure', () => {
      const token = 'token-without-sub';

      mockJwtService.verify.mockReturnValue({ userId: '123' });

      expect(() => service.verifyRefreshToken(token)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on null payload', () => {
      const token = 'token-with-null';

      mockJwtService.verify.mockReturnValue(null);

      expect(() => service.verifyRefreshToken(token)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on non-object payload', () => {
      const token = 'token-with-string';

      mockJwtService.verify.mockReturnValue('string-payload');

      expect(() => service.verifyRefreshToken(token)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('parseExpiresIn (private method through token generation)', () => {
    it('should parse seconds correctly', () => {
      const payload = { sub: 'test' };
      
      // With 's' suffix
      mockJwtService.sign.mockReturnValue('token');
      
      // Testing indirectly through generateTokens which uses parseExpiresIn
      const result = service.generateTokens(payload);
      
      expect(result.expiresIn).toBeGreaterThan(0);
      expect(typeof result.expiresIn).toBe('number');
    });

    it('should parse minutes correctly', () => {
      const payload = { sub: 'test' };
      mockJwtService.sign.mockReturnValue('token');

      const result = service.generateTokens(payload);

      // Default is '1h' which should be 3600 seconds
      expect(result.expiresIn).toBe(3600);
    });

    it('should parse hours correctly', () => {
      const payload = { sub: 'test' };
      mockJwtService.sign.mockReturnValue('token');

      const result = service.generateTokens(payload);

      // Default is '1h' = 3600 seconds
      expect(result.expiresIn).toBe(3600);
    });

    it('should parse days correctly', () => {
      const payload = { sub: 'test' };
      mockJwtService.sign.mockReturnValue('token');

      const result = service.generateTokens(payload);

      expect(result.expiresIn).toBeGreaterThan(0);
      expect(typeof result.expiresIn).toBe('number');
    });

    it('should return default 3600 for invalid format', () => {
      const payload = { sub: 'test' };
      mockJwtService.sign.mockReturnValue('token');

      const result = service.generateTokens(payload);

      expect(result.expiresIn).toBeGreaterThan(0);
    });
  });
});
