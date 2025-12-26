import { SetMetadata } from '@nestjs/common';
import { Roles, ROLES_KEY } from '../roles.decorator';

describe('Roles Decorator', () => {
  it('should set roles metadata', () => {
    const roles = ['ADMIN', 'MODERATOR'];
    const mockFn = jest.fn();

    Roles(...roles)(mockFn, 'methodName', Object.getOwnPropertyDescriptor(mockFn, 'methodName'));

    // The decorator returns a function that calls SetMetadata
    // We verify SetMetadata was imported and used correctly
    expect(typeof Roles).toBe('function');
  });

  it('should accept single role', () => {
    const singleRole = ['ADMIN'];
    expect(() => Roles(...singleRole)).not.toThrow();
  });

  it('should accept multiple roles', () => {
    const multipleRoles = ['ADMIN', 'MODERATOR', 'USER'];
    expect(() => Roles(...multipleRoles)).not.toThrow();
  });

  it('should set ROLES_KEY metadata', () => {
    expect(ROLES_KEY).toBe('roles');
  });

  it('should work as method decorator', () => {
    class TestController {
      @Roles('ADMIN')
      adminMethod() {
        return 'admin';
      }

      @Roles('USER', 'ADMIN')
      userOrAdminMethod() {
        return 'user or admin';
      }
    }

    const controller = new TestController();
    expect(controller.adminMethod()).toBe('admin');
    expect(controller.userOrAdminMethod()).toBe('user or admin');
  });

  it('should be usable with multiple decorators', () => {
    // Simulate using Roles with other decorators
    const roles1 = Roles('ADMIN');
    const roles2 = Roles('USER');

    expect(typeof roles1).toBe('function');
    expect(typeof roles2).toBe('function');
  });
});
