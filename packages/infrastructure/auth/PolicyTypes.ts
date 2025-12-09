/**
 * Policy Types for fine-grained RBAC
 */
export enum PolicyType {
    // User policies
    CAN_CREATE_USER = 'can_create_user',
    CAN_READ_ANY_USER = 'can_read_any_user',
    CAN_UPDATE_ANY_USER = 'can_update_any_user',
    CAN_DELETE_USER = 'can_delete_user',

    // Client policies
    CAN_CREATE_CLIENT = 'can_create_client',
    CAN_READ_OWN_CLIENTS = 'can_read_own_clients',
    CAN_READ_ANY_CLIENT = 'can_read_any_client',
    CAN_UPDATE_OWN_CLIENTS = 'can_update_own_clients',
    CAN_UPDATE_ANY_CLIENT = 'can_update_any_client',
    CAN_DELETE_CLIENT = 'can_delete_client',

    // Diet plan policies
    CAN_CREATE_DIET_PLAN = 'can_create_diet_plan',
    CAN_READ_OWN_DIET_PLANS = 'can_read_own_diet_plans',
    CAN_READ_ANY_DIET_PLAN = 'can_read_any_diet_plan',
    CAN_UPDATE_OWN_DIET_PLANS = 'can_update_own_diet_plans',
    CAN_UPDATE_ANY_DIET_PLAN = 'can_update_any_diet_plan',
    CAN_DELETE_DIET_PLAN = 'can_delete_diet_plan',
    CAN_ACTIVATE_DIET_PLAN = 'can_activate_diet_plan',

    // System policies
    CAN_VIEW_AUDIT_LOGS = 'can_view_audit_logs',
    CAN_MANAGE_SYSTEM = 'can_manage_system',
}

/**
 * Role-Policy mapping for RBAC
 */
export const ROLE_POLICIES: Record<string, PolicyType[]> = {
    ADMIN: [
        PolicyType.CAN_CREATE_USER,
        PolicyType.CAN_READ_ANY_USER,
        PolicyType.CAN_UPDATE_ANY_USER,
        PolicyType.CAN_DELETE_USER,
        PolicyType.CAN_CREATE_CLIENT,
        PolicyType.CAN_READ_ANY_CLIENT,
        PolicyType.CAN_UPDATE_ANY_CLIENT,
        PolicyType.CAN_DELETE_CLIENT,
        PolicyType.CAN_CREATE_DIET_PLAN,
        PolicyType.CAN_READ_ANY_DIET_PLAN,
        PolicyType.CAN_UPDATE_ANY_DIET_PLAN,
        PolicyType.CAN_DELETE_DIET_PLAN,
        PolicyType.CAN_ACTIVATE_DIET_PLAN,
        PolicyType.CAN_VIEW_AUDIT_LOGS,
        PolicyType.CAN_MANAGE_SYSTEM,
    ],
    DIETITIAN: [
        PolicyType.CAN_CREATE_CLIENT,
        PolicyType.CAN_READ_OWN_CLIENTS,
        PolicyType.CAN_UPDATE_OWN_CLIENTS,
        PolicyType.CAN_CREATE_DIET_PLAN,
        PolicyType.CAN_READ_OWN_DIET_PLANS,
        PolicyType.CAN_UPDATE_OWN_DIET_PLANS,
        PolicyType.CAN_ACTIVATE_DIET_PLAN,
    ],
    CLIENT: [
        PolicyType.CAN_READ_OWN_DIET_PLANS,
    ],
};

/**
 * Check if a role has a specific policy
 */
export function hasPolicy(role: string, policy: PolicyType): boolean {
    const policies = ROLE_POLICIES[role] || [];
    return policies.includes(policy);
}

/**
 * Get all policies for a role
 */
export function getPoliciesForRole(role: string): PolicyType[] {
    return [...(ROLE_POLICIES[role] || [])];
}

/**
 * Check if role has all specified policies
 */
export function hasAllPolicies(role: string, policies: PolicyType[]): boolean {
    const rolePolicies = ROLE_POLICIES[role] || [];
    return policies.every((policy) => rolePolicies.includes(policy));
}

/**
 * Check if role has any of the specified policies
 */
export function hasAnyPolicy(role: string, policies: PolicyType[]): boolean {
    const rolePolicies = ROLE_POLICIES[role] || [];
    return policies.some((policy) => rolePolicies.includes(policy));
}
