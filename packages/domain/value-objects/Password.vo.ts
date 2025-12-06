import { Result, ValidationError } from '../common/Result';

/**
 * Password Value Object
 * Ensures password strength validation at domain level
 */
export class Password {
  private readonly value: string;

  private constructor(password: string) {
    this.value = password;
  }

  /**
   * Create a password with validation
   * Requirements:
   * - At least 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   */
  public static create(password: string): Result<Password, ValidationError> {
    if (!password) {
      return Result.fail(new ValidationError('Password cannot be empty'));
    }

    if (password.length < 8) {
      return Result.fail(new ValidationError('Password must be at least 8 characters long'));
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return Result.fail(
        new ValidationError(
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
      );
    }

    return Result.ok(new Password(password));
  }

  /**
   * Create from already hashed password (e.g., from database)
   */
  public static fromHash(hashedPassword: string): Password {
    if (!hashedPassword) {
      throw new Error('Hashed password cannot be empty');
    }
    return new Password(hashedPassword);
  }

  /**
   * Alias for fromHash for backward compatibility
   */
  public static createFromHash(hashedPassword: string): Password {
    return Password.fromHash(hashedPassword);
  }

  public getValue(): string {
    return this.value;
  }
}
