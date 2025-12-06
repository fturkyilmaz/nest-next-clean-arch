// user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
