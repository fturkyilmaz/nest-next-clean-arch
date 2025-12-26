/**
 * WebSocket Gateway - NestJS Backend
 *
 * WebSocket gateway for real-time data synchronization across clients.
 * Handles connections, subscriptions, and broadcasts entity updates.
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketEventType,
  WebSocketMessage,
  EntityUpdatePayload,
} from '@diet/shared';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
  authenticated?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class AppWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('WebSocketGateway');
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(private jwtService: JwtService) {}

  @SubscribeMessage(WebSocketEventType.AUTHENTICATE)
  async handleAuthentication(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    try {
      const token = (socket.handshake.auth.token || socket.handshake.query.token) as string;

      if (!token) {
        socket.emit(WebSocketEventType.UNAUTHORIZED, {
          error: 'No token provided',
        });
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      socket.userId = payload.sub;
      socket.sessionId = payload.sessionId;
      socket.authenticated = true;

      // Track socket
      if (!this.userSockets.has(socket.userId)) {
        this.userSockets.set(socket.userId, new Set());
      }
      this.userSockets.get(socket.userId)!.add(socket.id);
      this.socketUsers.set(socket.id, socket.userId);

      socket.join(`user:${socket.userId}`);

      this.logger.log(`User ${socket.userId} authenticated on socket ${socket.id}`);

      socket.emit(WebSocketEventType.AUTHENTICATE, {
        authenticated: true,
        userId: socket.userId,
      });

      // Notify others user is online
      this.broadcastUserStatus(socket.userId, true);
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      socket.emit(WebSocketEventType.UNAUTHORIZED, {
        error: 'Invalid token',
      });
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!socket.authenticated || !socket.userId) {
      socket.emit(WebSocketEventType.UNAUTHORIZED);
      return;
    }

    socket.join(data.room);
    this.logger.log(`Socket ${socket.id} subscribed to room: ${data.room}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    socket.leave(data.room);
    this.logger.log(`Socket ${socket.id} unsubscribed from room: ${data.room}`);
  }

  handleConnection(socket: AuthenticatedSocket) {
    this.logger.log(`New connection: ${socket.id}`);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    const userId = this.socketUsers.get(socket.id);

    if (userId) {
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        // If no more sockets for this user, remove from tracking
        if (userSockets.size === 0) {
          this.userSockets.delete(userId);
          this.broadcastUserStatus(userId, false);
        }
      }

      this.socketUsers.delete(socket.id);
    }

    this.logger.log(`Disconnected: ${socket.id}`);
  }

  /**
   * Broadcast entity update to specific user
   */
  broadcastToUser(userId: string, event: WebSocketEventType, data: any): void {
    this.server.to(`user:${userId}`).emit(event, {
      event,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast entity update to room
   */
  broadcastToRoom(room: string, event: WebSocketEventType, data: any): void {
    this.server.to(room).emit(event, {
      event,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast entity update to all users except sender
   */
  broadcastExcept(
    socketId: string,
    event: WebSocketEventType,
    data: any,
  ): void {
    this.server.except(socketId).emit(event, {
      event,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast user online/offline status
   */
  private broadcastUserStatus(userId: string, isOnline: boolean): void {
    const event = isOnline ? WebSocketEventType.USER_ONLINE : WebSocketEventType.USER_OFFLINE;

    this.server.emit(event, {
      event,
      data: {
        userId,
        isOnline,
        timestamp: new Date(),
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast diet plan update
   */
  broadcastDietPlanUpdate(dietPlanId: string, data: any, event = WebSocketEventType.DIET_PLAN_UPDATED): void {
    const room = `diet-plan:${dietPlanId}`;
    this.broadcastToRoom(room, event, data);
  }

  /**
   * Broadcast meal update
   */
  broadcastMealUpdate(mealId: string, data: any, event = WebSocketEventType.MEAL_UPDATED): void {
    const room = `meal:${mealId}`;
    this.broadcastToRoom(room, event, data);
  }

  /**
   * Broadcast metrics update
   */
  broadcastMetricsUpdate(userId: string, data: any): void {
    this.broadcastToUser(userId, WebSocketEventType.METRICS_UPDATE, data);
  }

  /**
   * Broadcast appointment reminder
   */
  broadcastAppointmentReminder(userId: string, data: any): void {
    this.broadcastToUser(userId, WebSocketEventType.APPOINTMENT_REMINDER, data);
  }

  /**
   * Broadcast notification
   */
  broadcastNotification(userId: string, notification: any): void {
    this.broadcastToUser(userId, WebSocketEventType.NOTIFICATION, notification);
  }

  /**
   * Send error to socket
   */
  sendError(socketId: string, error: { code: string; message: string; details?: any }): void {
    this.server.to(socketId).emit(WebSocketEventType.ERROR, {
      event: WebSocketEventType.ERROR,
      error,
      timestamp: Date.now(),
    });
  }
}
