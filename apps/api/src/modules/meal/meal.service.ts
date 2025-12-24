import { Injectable } from '@nestjs/common';

@Injectable()
export class MealService {
  findAll() {
    return [{ id: 1, name: 'Breakfast', calories: 400 }];
  }

  create(dto: any) {
    return { id: Date.now(), ...dto };
  }
}
