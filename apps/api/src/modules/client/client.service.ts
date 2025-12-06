import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientService {
  private clients = [];

  findAll() {
    return this.clients;
  }

  create(dto: { name: string; dietitianId: string }) {
    const client = { id: `c_${Date.now()}`, ...dto };
    this.clients.push(client);
    return client;
  }
}
