import { Result, ValidationError } from '@domain/common/Result';

/**
 * Enhanced Email Value Object with Result type
 */
export class Email {
  private constructor(private readonly value: string) {}

  public static create(email: string): Result<Email, ValidationError> {
    if (!email || email.trim().length === 0) {
      return Result.fail(new ValidationError('Email cannot be empty'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Result.fail(
        new ValidationError('Invalid email format', { email })
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    return Result.ok(new Email(normalizedEmail));
  }

  public getValue(): string {
    return this.value;
  }

  public getDomain(): string {
    return this.value.split('@')[1];
  }

  public getLocalPart(): string {
    return this.value.split('@')[0];
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  // Prevent direct instantiation
  private static fromString(value: string): Email {
    return new Email(value);
  }
}
