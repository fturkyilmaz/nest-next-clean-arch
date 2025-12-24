import { Injectable } from '@nestjs/common';

@Injectable()
export class FoodService {
  findAll() {
    return [{ id: 1, name: 'Apple', calories: 52 }];
  }

  create(dto: any) {
    return { id: Date.now(), ...dto };
  }
}
