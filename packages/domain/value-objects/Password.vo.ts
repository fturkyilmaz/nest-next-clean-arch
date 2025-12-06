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
   * - At least one special character
   */
  public static create(password: string): Password {
    if (!password) {
      throw new Error('Password cannot be empty');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new Error(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }

    return new Password(password);
  }

  /**
   * Create from already hashed password (e.g., from database)
   */
  public static createFromHash(hashedPassword: string): Password {
    if (!hashedPassword) {
      throw new Error('Hashed password cannot be empty');
    }
    return new Password(hashedPassword);
  }

  public getValue(): string {
    return this.value;
  }
}
