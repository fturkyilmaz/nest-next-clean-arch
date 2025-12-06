import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/users')
export class UserController {
  @Get('me')
  me() {
    return { id: 'u1', email: 'dietitian@example.com', role: 'dietitian' };
  }
}
