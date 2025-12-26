import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '@shared/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // If user is not present (e.g. AuthGuard not used or failed), try to decode from header
    if (!request.user) {
      const authHeader = request.headers['authorization'];


      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          // Use the same fallback secret as JwtAuthService
          const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

          // Manual verification as fallback
          const payload = this.jwtService.verify(token, {
            secret: secret
          });
          request.user = payload;
        } catch (error) {
          console.error('Token verification failed in RolesGuard:', error);
        }
      } else {
        console.warn('No Authorization header found or invalid format');
      }
    }

    const user = request.user;

    if (!user?.role) {
      throw new ForbiddenException('User role not found or unauthorized');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
