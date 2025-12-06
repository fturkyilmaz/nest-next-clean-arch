import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for managing secrets securely
 * In production, this should integrate with AWS Secrets Manager, Azure Key Vault, etc.
 */
@Injectable()
export class SecretManagerService {
  constructor(private configService: ConfigService) {}

  /**
   * Get secret value
   * In production, this would fetch from external secret store
   */
  async getSecret(key: string): Promise<string> {
    // For development, use environment variables
    const secret = this.configService.get<string>(key);

    if (!secret) {
      throw new Error(`Secret ${key} not found`);
    }

    return secret;
  }

  /**
   * Get database connection string
   */
  async getDatabaseUrl(): Promise<string> {
    return await this.getSecret('DATABASE_URL');
  }

  /**
   * Get JWT secret
   */
  async getJwtSecret(): Promise<string> {
    return await this.getSecret('JWT_SECRET');
  }

  /**
   * Get JWT refresh secret
   */
  async getJwtRefreshSecret(): Promise<string> {
    return await this.getSecret('JWT_REFRESH_SECRET');
  }

  /**
   * Get encryption key
   */
  async getEncryptionKey(): Promise<string> {
    return await this.getSecret('ENCRYPTION_KEY');
  }

  /**
   * Validate all required secrets are present
   */
  async validateSecrets(): Promise<void> {
    const requiredSecrets = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'ENCRYPTION_KEY',
    ];

    for (const secret of requiredSecrets) {
      try {
        await this.getSecret(secret);
      } catch (error) {
        throw new Error(`Missing required secret: ${secret}`);
      }
    }
  }
}
