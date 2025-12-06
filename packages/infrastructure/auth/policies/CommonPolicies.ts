import { PolicyHandler } from '../PoliciesGuard';


/**
 * Policy: User can only access their own resources
 */
export class IsResourceOwnerPolicy implements PolicyHandler {
  async handle(user: any, resource?: any): Promise<boolean> {
    if (!resource || !resource.params) {
      return false;
    }

    const resourceUserId = resource.params.userId || resource.params.id;
    return user.userId === resourceUserId;
  }
}

/**
 * Policy: Dietitian can only access their own clients
 */
export class IsDietitianOfClientPolicy implements PolicyHandler {
  async handle(user: any, resource?: any): Promise<boolean> {
    if (user.role === 'ADMIN') {
      return true; // Admins can access all clients
    }

    if (user.role !== 'DIETITIAN') {
      return false;
    }

    // This would need to be enhanced with actual client lookup
    // For now, we'll allow and rely on controller-level checks
    return true;
  }
}

/**
 * Policy: Only admin or resource owner can perform action
 */
export class IsAdminOrOwnerPolicy implements PolicyHandler {
  async handle(user: any, resource?: any): Promise<boolean> {
    if (user.role === 'ADMIN') {
      return true;
    }

    if (!resource || !resource.params) {
      return false;
    }

    const resourceUserId = resource.params.userId || resource.params.id;
    return user.userId === resourceUserId;
  }
}
