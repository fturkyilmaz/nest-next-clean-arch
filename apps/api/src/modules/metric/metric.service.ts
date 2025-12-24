import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricService {
  findAll() {
    return [{ id: 1, clientId: 'abc', weight: 70, bmi: 22 }];
  }

  create(dto: any) {
    return { id: Date.now(), ...dto };
  }
}
