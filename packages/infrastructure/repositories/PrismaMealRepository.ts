import { MealRepository } from '@domain/repositories/MealRepository';
import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
@Injectable()
export class PrismaMealRepository implements MealRepository {
  async create(data: any): Promise<any> {
    return prisma.meal.create( data );
  }

  async findAll(): Promise<any[]> {
    return prisma.meal.findMany();

  }

  async findById(id: string): Promise<any | null> {
    return prisma.meal.findUnique({ where: { id } });
  }
}
