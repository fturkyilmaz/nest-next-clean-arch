export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly role: 'admin' | 'dietitian' | 'client',
        public readonly passwordHash: string
    ) { }

    changeEmail(newEmail: string) {
        if (!newEmail.includes('@')) {
            throw new Error('Invalid email');
        }
        return new User(this.id, newEmail, this.role, this.passwordHash);
    }
}
