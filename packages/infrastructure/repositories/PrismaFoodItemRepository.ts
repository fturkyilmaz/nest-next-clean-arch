import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';
import { IFoodItemRepository } from '../../application/interfaces/IFoodItemRepository';
import { FoodItem, FoodCategory } from '../../domain/entities/FoodItem.entity';
import { NutritionalValue } from '../../domain/value-objects/NutritionalValue.vo';

@Injectable()
export class PrismaFoodItemRepository implements IFoodItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<FoodItem | null> {
    const foodItem = await this.prisma.foodItem.findUnique({
      where: { id },
    });

    if (!foodItem) {
      return null;
    }

    return this.toDomain(foodItem);
  }

  async findByName(name: string): Promise<FoodItem | null> {
    const foodItem = await this.prisma.foodItem.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (!foodItem) {
      return null;
    }

    return this.toDomain(foodItem);
  }

  async findAll(filters?: {
    category?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<FoodItem[]> {
    const foodItems = await this.prisma.foodItem.findMany({
      where: {
        category: filters?.category as any,
        isActive: filters?.isActive,
      },
      skip: filters?.skip,
      take: filters?.take,
      orderBy: { name: 'asc' },
    });

    return foodItems.map((item) => this.toDomain(item));
  }

  async search(
    query: string,
    options?: {
      category?: string;
      skip?: number;
      take?: number;
    }
  ): Promise<FoodItem[]> {
    const foodItems = await this.prisma.foodItem.findMany({
      where: {
        category: options?.category as any,
        isActive: true,
        name: { contains: query, mode: 'insensitive' },
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { name: 'asc' },
    });

    return foodItems.map((item) => this.toDomain(item));
  }

  async count(filters?: { category?: string; isActive?: boolean }): Promise<number> {
    return await this.prisma.foodItem.count({
      where: {
        category: filters?.category as any,
        isActive: filters?.isActive,
      },
    });
  }

  async create(foodItem: FoodItem): Promise<FoodItem> {
    const data = this.toPersistence(foodItem);

    const created = await this.prisma.foodItem.create({
      data,
    });

    return this.toDomain(created);
  }

  async update(foodItem: FoodItem): Promise<FoodItem> {
    const data = this.toPersistence(foodItem);

    const updated = await this.prisma.foodItem.update({
      where: { id: foodItem.getId() },
      data,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.foodItem.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  // Mapper methods
  private toDomain(raw: any): FoodItem {
    const nutritionalValue = NutritionalValue.create({
      calories: raw.calories,
      protein: raw.protein,
      carbs: raw.carbs,
      fat: raw.fat,
      fiber: raw.fiber,
      sugar: raw.sugar,
      sodium: raw.sodium,
    });

    return FoodItem.reconstitute({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      category: raw.category as FoodCategory,
      servingSize: raw.servingSize,
      servingUnit: raw.servingUnit,
      nutritionalValue,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private toPersistence(foodItem: FoodItem): any {
    const nutrition = foodItem.getNutritionalValue();

    return {
      id: foodItem.getId() || undefined,
      name: foodItem.getName(),
      description: foodItem.getDescription(),
      category: foodItem.getCategory(),
      servingSize: foodItem.getServingSize(),
      servingUnit: foodItem.getServingUnit(),
      calories: nutrition.getCalories(),
      protein: nutrition.getProtein(),
      carbs: nutrition.getCarbs(),
      fat: nutrition.getFat(),
      fiber: nutrition.getFiber(),
      sugar: nutrition.getSugar(),
      sodium: nutrition.getSodium(),
      isActive: foodItem.isActive(),
      updatedAt: foodItem.getUpdatedAt(),
    };
  }
}
