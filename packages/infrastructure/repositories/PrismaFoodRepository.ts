import { FoodRepository } from '@domain/repositories/FoodRepository';
import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
@Injectable()
export class PrismaFoodRepository implements FoodRepository {
  async create(data: any): Promise<any> {
    return prisma.foodItem.create( data );

  }

  async findAll(): Promise<any[]> {
    return prisma.foodItem.findMany();
      
  }

  async findById(id: string): Promise<any | null> {
    return prisma.foodItem.findUnique({ where: { id } });
  }
}
