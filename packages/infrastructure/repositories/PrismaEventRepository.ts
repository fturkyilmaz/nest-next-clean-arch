import { EventRepository } from '@domain/repositories/EventRepository';
import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
@Injectable()
export class PrismaEventRepository implements EventRepository {
  async create(data: any): Promise<any> {
    return prisma.eventStore.create( data )
 
  }

  async findAll(): Promise<any[]> {
    return prisma.eventStore.findMany();
    
  }

  async findById(id: string): Promise<any | null> {
    return prisma.eventStore.findUnique({ where: { id } });
  }
}
