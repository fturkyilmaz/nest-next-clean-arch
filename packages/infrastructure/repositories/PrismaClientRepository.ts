import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/PrismaService';
import { IClientRepository } from '../interfaces/IClientRepository';
import { Client } from '../../domain/entities/Client.entity';

/**
 * Optimized Client Repository with N+1 prevention
 */
@Injectable()
export class PrismaClientRepository implements IClientRepository {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService
  ) {}

  /**
   * Get clients with dietitian data (prevents N+1)
   */
  async findByDietitianWithDetails(dietitianId: string): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        dietitianId,
        deletedAt: null,
      },
      include: {
        dietitian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        // Lazy load metrics only when needed
        _count: {
          select: {
            metrics: true,
            dietPlans: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return clients.map((client) => this.toDomain(client));
  }

  /**
   * Get clients with latest metrics (optimized query)
   */
  async findWithLatestMetrics(dietitianId: string): Promise<any[]> {
    // Use raw SQL for complex aggregation to avoid N+1
    return this.prisma.$queryRaw`
      SELECT 
        c.*,
        cm.weight,
        cm.height,
        cm.bmi,
        cm.recorded_at as latest_metric_date
      FROM "Client" c
      LEFT JOIN LATERAL (
        SELECT weight, height, bmi, recorded_at
        FROM "ClientMetrics"
        WHERE client_id = c.id
        ORDER BY recorded_at DESC
        LIMIT 1
      ) cm ON true
      WHERE c.dietitian_id = ${dietitianId}
        AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `;
  }

  /**
   * Batch load clients (DataLoader pattern)
   */
  async findByIds(ids: string[]): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
    });

    // Maintain order of input IDs
    const clientMap = new Map(clients.map((c) => [c.id, c]));
    return ids.map((id) => clientMap.get(id)).filter(Boolean) as any[];
  }

  private toDomain(prismaClient: any): Client {
    // Convert Prisma model to domain entity
    return Client.reconstitute({
      id: prismaClient.id,
      email: prismaClient.email,
      firstName: prismaClient.firstName,
      lastName: prismaClient.lastName,
      phone: prismaClient.phone,
      dateOfBirth: prismaClient.dateOfBirth,
      gender: prismaClient.gender,
      dietitianId: prismaClient.dietitianId,
      allergies: prismaClient.allergies,
      medicalConditions: prismaClient.medicalConditions,
      dietaryPreferences: prismaClient.dietaryPreferences,
      activityLevel: prismaClient.activityLevel,
      goal: prismaClient.goal,
      isActive: prismaClient.isActive,
      createdAt: prismaClient.createdAt,
      updatedAt: prismaClient.updatedAt,
    });
  }

  // Implement other IClientRepository methods...
  async create(client: Client): Promise<Client> {
    throw new Error('Method not implemented.');
  }

  async update(client: Client): Promise<Client> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<Client | null> {
    throw new Error('Method not implemented.');
  }

  async findByEmail(email: string): Promise<Client | null> {
    throw new Error('Method not implemented.');
  }

  async findByDietitian(dietitianId: string, skip?: number, take?: number): Promise<Client[]> {
    throw new Error('Method not implemented.');
  }

  async search(query: string, dietitianId?: string): Promise<Client[]> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
