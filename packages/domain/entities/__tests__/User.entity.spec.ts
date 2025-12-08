
import { User, UserRole } from '../User.entity';
import { Email } from '../../value-objects/Email.vo';
import { Password } from '../../value-objects/Password.vo';

describe('User Entity', () => {
    let email: Email;
    let password: Password;

    beforeAll(() => {
        const emailResult = Email.create('test@example.com');
        email = emailResult.getValue();

        const passwordResult = Password.create('Password123!');
        if (passwordResult.isFailure()) throw new Error(passwordResult.getError().toString());
        password = passwordResult.getValue();
    });

    it('should create a user with default client role', () => {
        const user = User.create({
            id: '123e4567-e89b-12d3-a456-426614174000',
            email,
            password,
            firstName: 'John',
            lastName: 'Doe',
            role: UserRole.CLIENT,
            isActive: true,
        });

        expect(user).toBeDefined();
        expect(user.getId()).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(user.getEmail().equals(email)).toBeTruthy();
        expect(user.getRole()).toBe(UserRole.CLIENT);
        expect(user.isActive()).toBeTruthy();
        expect(user.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should update profile correctly', () => {
        const user = User.create({
            id: '123e4567-e89b-12d3-a456-426614174000',
            email,
            password,
            firstName: 'John',
            lastName: 'Doe',
            role: UserRole.CLIENT,
            isActive: true,
        });

        user.updateProfile('Jane', 'Smith');
        expect(user.getFirstName()).toBe('Jane');
        expect(user.getLastName()).toBe('Smith');
    });

    it('should throw error when updating profile with empty content', () => {
        const user = User.create({
            id: '123e4567-e89b-12d3-a456-426614174000',
            email,
            password,
            firstName: 'John',
            lastName: 'Doe',
            role: UserRole.CLIENT,
            isActive: true,
        });

        expect(() => user.updateProfile('', 'Smith')).toThrow('First name and last name are required');
        expect(() => user.updateProfile('Jane', '')).toThrow('First name and last name are required');
    });
});
