import { Injectable } from '@nestjs/common';

@Injectable()
export class AppointmentService {
  findAll() {
    return [{ id: 1, title: 'Sample appointment' }];
  }

  findOne(id: string) {
    return { id, title: 'Appointment detail' };
  }

  create(dto: any) {
    return { id: Date.now(), ...dto };
  }
}
