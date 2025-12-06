export class Email {
    constructor(public readonly value: string) {
        if (!value.includes('@')) {
            throw new Error('Invalid email format');
        }
    }
}
