export class AuthPolicy {
    static canManageClients(role: string): boolean {
        return role === 'dietitian' || role === 'admin';
    }

    static canManageDietPlans(role: string): boolean {
        return role === 'dietitian' || role === 'admin';
    }
}
