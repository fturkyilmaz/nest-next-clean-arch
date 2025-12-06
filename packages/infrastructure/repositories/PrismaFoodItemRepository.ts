import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { PrismaRepositoryBase } from './PrismaRepositoryBase';
import { FoodItem } from '@domain/entities/FoodItem.entity';
import { NutritionalValue } from '@domain/value-objects/NutritionalValue.vo';

/**
 * FoodItem Repository using Generic Base
 */
@Injectable()
export class PrismaFoodItemRepository extends PrismaRepositoryBase<any, FoodItem, string> {
  constructor(prisma: PrismaService) {
    super(prisma, 'foodItem');
  }

  protected toDomain(model: any): FoodItem {
    const nutritionalValue = NutritionalValue.create({
      calories: model.calories,
      protein: model.protein,
      carbs: model.carbohydrates || model.carbs, // Handle both DB column names
      fat: model.fat,
      fiber: model.fiber,
      sugar: model.sugar,
    });

    return FoodItem.reconstitute({
      id: model.id,
      name: model.name,
      description: model.description,
      category: model.category,
      servingSize: model.servingSize,
      servingUnit: model.servingUnit,
      nutritionalValue: nutritionalValue, // Pass the object directly
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  protected toPrisma(domain: FoodItem): any {
    const nutrition = domain.getNutritionalValue();
    
    return {
      id: domain.getId(),
      name: domain.getName(),
      description: domain.getDescription(),
      category: domain.getCategory(),
      servingSize: domain.getServingSize(),
      servingUnit: domain.getServingUnit(),
      calories: nutrition.getCalories(),
      protein: nutrition.getProtein(),
      carbohydrates: nutrition.getCarbs(), // Map domain 'carbs' to DB 'carbohydrates'
      fat: nutrition.getFat(),
      fiber: nutrition.getFiber(),
      sugar: nutrition.getSugar(),
      isActive: domain.isActive(),
    };
  }

  // Custom methods
  async findByCategory(category: string): Promise<FoodItem[]> {
    const models = await this.model.findMany({
      where: { category, isActive: true },
    });
    return models.map((m: any) => this.toDomain(m));
  }

  async search(query: string): Promise<FoodItem[]> {
    const models = await this.model.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
    });
    return models.map((m: any) => this.toDomain(m));
  }
}
