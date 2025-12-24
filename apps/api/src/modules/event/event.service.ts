import { Injectable } from '@nestjs/common';

@Injectable()
export class EventService {
  findAll() {
    return [{ id: 1, type: 'UserRegistered', timestamp: new Date() }];
  }
}
