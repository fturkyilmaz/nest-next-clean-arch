import { SetMetadata } from '@nestjs/common';
import { POLICIES_KEY, PolicyHandler } from './PoliciesGuard';

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(POLICIES_KEY, handlers);
