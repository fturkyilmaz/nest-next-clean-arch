import { AppointmentRepository } from '@domain/repositories/AppointmentRepository';
import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  async create(data: any): Promise<any> {
    return prisma.appointment.create(( data ));
}

  async findAll(): Promise<any[]> {
    return prisma.appointment.findMany();
    
  }

  async findById(id: string): Promise<any | null> {
    return prisma.appointment.findUnique({ where: { id  } });
  }}
