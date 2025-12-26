/**
 * WebSocket Module - NestJS
 *
 * Sets up WebSocket gateway with proper integration.
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppWebSocketGateway } from './websocket.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret',
    }),
  ],
  providers: [AppWebSocketGateway],
  exports: [AppWebSocketGateway],
})
export class WebSocketModule {}
