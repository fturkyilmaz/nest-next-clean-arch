import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string) {
    return { id: 'u1', email, role: 'dietitian' };
  }
}
