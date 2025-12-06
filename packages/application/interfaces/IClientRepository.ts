import { Client } from '@domain/entities/Client.entity';

export interface IClientRepository {
  /**
   * Find client by ID
   */
  findById(id: string): Promise<Client | null>;

  /**
   * Find client by email
   */
  findByEmail(email: string): Promise<Client | null>;

  /**
   * Find all clients for a specific dietitian
   */
  findByDietitianId(
    dietitianId: string,
    filters?: {
      isActive?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<Client[]>;

  /**
   * Find all clients with optional filtering
   */
  findAll(filters?: {
    dietitianId?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<Client[]>;

  /**
   * Search clients by name or email
   */
  search(
    query: string,
    dietitianId?: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<Client[]>;

  /**
   * Count clients with optional filtering
   */
  count(filters?: { dietitianId?: string; isActive?: boolean }): Promise<number>;

  /**
   * Create a new client
   */
  create(client: Client): Promise<Client>;

  /**
   * Update an existing client
   */
  update(client: Client): Promise<Client>;

  /**
   * Delete a client (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if email exists
   */
  existsByEmail(email: string): Promise<boolean>;
}
