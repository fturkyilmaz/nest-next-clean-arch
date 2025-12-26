import { AuditRepository } from '@domain/repositories/AuditRepository';
import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
@Injectable() 
export class PrismaAuditRepository implements AuditRepository {
  async create(data: any): Promise<any> {
    return prisma.auditLog.create( data )
  }

  async findAll(): Promise<any[]> {
    return prisma.auditLog.findMany();
    
  }

  async findById(id: string): Promise<any | null> {
    return prisma.auditLog.findUnique({ where: { id } });
  }
}
