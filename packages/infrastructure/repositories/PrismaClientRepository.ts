import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { PrismaRepositoryBase } from './PrismaRepositoryBase';
import { Client } from '@domain/entities/Client.entity';

/**
 * Client Repository using Generic Base
 */
@Injectable()
export class PrismaClientRepository extends PrismaRepositoryBase<any, Client, string> {
  constructor(prisma: PrismaService) {
    super(prisma, 'client');
  }

  protected toDomain(model: any): Client {
    // Note: We're mapping database fields to domain fields
    // If DB has extra fields like dietaryPreferences, activityLevel, goal,
    // we ignore them as they are not in the current Client entity
    return Client.reconstitute({
      id: model.id,
      email: model.email,
      firstName: model.firstName,
      lastName: model.lastName,
      phone: model.phone,
      dateOfBirth: model.dateOfBirth,
      gender: model.gender,
      dietitianId: model.dietitianId,
      allergies: model.allergies || [],
      conditions: model.conditions || model.medicalConditions || [], 
      medications: model.medications || [], // Added medications mapping
      notes: model.notes, // Added notes mapping
      isActive: model.isActive ?? true,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    });
  }

  protected toPrisma(domain: Client): any {
    return {
      id: domain.getId() || undefined, // undefined allows Prisma to generate ID if needed, though usually we generate in Domain or DB
      email: domain.getEmail().getValue(), // Email is a Value Object
      firstName: domain.getFirstName(),
      lastName: domain.getLastName(),
      phone: domain.getPhone(),
      dateOfBirth: domain.getDateOfBirth(),
      gender: domain.getGender(),
      dietitianId: domain.getDietitianId(),
      allergies: domain.getAllergies(),
      conditions: domain.getConditions(),
      medications: domain.getMedications(),
      notes: domain.getNotes(),
      isActive: domain.isActive(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt(),
    };
  }

  // Custom methods
  async findByEmail(email: string): Promise<Client | null> {
    const model = await this.model.findUnique({ where: { email } });
    return model ? this.toDomain(model) : null;
  }

  async findByDietitian(dietitianId: string): Promise<Client[]> {
    const models = await this.model.findMany({
      where: { dietitianId, deletedAt: null },
    });
    return models.map((m: any) => this.toDomain(m));
  }
}
