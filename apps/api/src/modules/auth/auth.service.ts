// auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();
  private secret = process.env.JWT_SECRET || 'secret';

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const token = jwt.sign({ sub: user.id, role: user.role }, this.secret, { expiresIn: '1h' });
    return { accessToken: token };
  }
}
