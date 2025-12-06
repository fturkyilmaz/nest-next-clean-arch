import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const POLICIES_KEY = 'policies';

export interface PolicyHandler {
  handle(user: any, resource?: any): Promise<boolean>;
}


/**
 * Policy-based authorization guard
 * Allows fine-grained access control beyond simple role checks
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(POLICIES_KEY, context.getHandler()) || [];

    if (policyHandlers.length === 0) {
      return true;
    }

    const { user, params, body } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Execute all policy handlers
    for (const handler of policyHandlers) {
      const allowed = await handler.handle(user, { params, body });
      if (!allowed) {
        throw new ForbiddenException('Access denied by policy');
      }
    }

    return true;
  }
}
