import { MetricRepository } from '@domain/repositories/MetricRepository';
import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
@Injectable()
export class PrismaMetricRepository implements MetricRepository {
  async create(data: any): Promise<any> {
    return prisma.clientMetrics.create( data );
  }

  async findAll(): Promise<any[]> {
    return prisma.clientMetrics.findMany();
  }

  async findById(id: string): Promise<any | null> {
    return prisma.clientMetrics.findUnique({ where: { id } }); 
  }
}
