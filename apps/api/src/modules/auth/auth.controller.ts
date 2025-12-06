import { Controller, Post, Body } from '@nestjs/common';

@Controller('api/v1/auth')
export class AuthController {
  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return { accessToken: 'jwt-token', refreshToken: 'jwt-refresh' };
  }
}
