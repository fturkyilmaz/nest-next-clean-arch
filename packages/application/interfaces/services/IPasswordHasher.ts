/**
 * Password Hasher Interface
 * Abstraction for password hashing to avoid infrastructure dependency in application layer
 */
export interface IPasswordHasher {
  /**
   * Hash a plain text password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare plain text password with hash
   */
  compare(password: string, hash: string): Promise<boolean>;

  /**
   * Verify password strength
   */
  verifyStrength(password: string): boolean;
}
