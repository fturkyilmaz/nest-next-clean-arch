import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
import { FoodRepository } from '@domain/repositories/FoodRepository';
import { FoodItem } from '@domain/entities/FoodItem.entity';

@Injectable()
export class PrismaFoodRepository implements FoodRepository {
  async create(entity: FoodItem): Promise<FoodItem> {

    console.log("entity", entity);
    console.log("entity prisma", entity.toPrisma());
    const created = await prisma.foodItem.create({
      data: entity.toPrisma(),
    });



    return FoodItem.reconstitute(created);
  }

  async findAll(): Promise<FoodItem[]> {
    const items = await prisma.foodItem.findMany();
    return items.map(FoodItem.reconstitute);
  }

  async findById(id: string): Promise<FoodItem | null> {
    const item = await prisma.foodItem.findUnique({ where: { id } });
    return item ? FoodItem.reconstitute(item) : null;
  }
}
