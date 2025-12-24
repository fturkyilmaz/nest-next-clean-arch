import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditService {
  findAll() {
    return [{ id: 1, userId: 'abc', action: 'LOGIN', createdAt: new Date() }];
  }
}
