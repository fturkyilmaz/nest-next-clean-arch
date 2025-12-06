import { User } from '@domain/entities/User.entity';

export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users with optional filtering
   */
  findAll(filters?: {
    role?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<User[]>;

  /**
   * Count users with optional filtering
   */
  count(filters?: { role?: string; isActive?: boolean }): Promise<number>;

  /**
   * Create a new user
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user
   */
  update(user: User): Promise<User>;

  /**
   * Delete a user (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if email exists
   */
  existsByEmail(email: string): Promise<boolean>;
}
