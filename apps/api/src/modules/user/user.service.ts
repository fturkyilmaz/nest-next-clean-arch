import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async findById(id: string) {
    return { id, email: 'dietitian@example.com', role: 'dietitian' };
  }
}
