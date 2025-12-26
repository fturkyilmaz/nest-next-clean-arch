
export interface IReportRepository {
  create(data: any): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  findAll(filters?: {
    role?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<Report[]>;
  /**
   * Count users with optional filtering
   */
  count(filters?: { role?: string; isActive?: boolean }): Promise<number>;

  /**
   * Create a new user
   */
  create(user: Report): Promise<Report>;

  /**
   * Update an existing user
   */
  update(user: Report): Promise<Report>;

  /**
   * Delete a user (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if email exists
   */
  existsByEmail(email: string): Promise<boolean>;
}
