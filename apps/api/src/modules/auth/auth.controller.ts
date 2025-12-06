// auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly service: AuthService) { }

  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    return this.service.login(dto.email, dto.password);
  }
}
