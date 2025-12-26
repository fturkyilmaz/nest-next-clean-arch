# Web Dashboard & Real-Time WebSocket Guide

## Overview

The web dashboard provides a comprehensive interface for managing diet plans, meals, foods, metrics, and appointments with real-time synchronization via WebSocket. Users see instant updates when data changes across all connected devices.

## Architecture

### Frontend Components (React/Next.js)
- **Pages**: Meals, Foods, Metrics, Appointments dashboards
- **WebSocket Hook**: `useWebSocket` for connection management
- **Data Sync Hooks**: `useWebSocketDataSync`, `useWebSocketInvalidation`
- **Real-time Event Handler**: `useWebSocketEvent`

### Backend (NestJS)
- **WebSocket Gateway**: Handles connections, authentication, broadcasts
- **Event Types**: 20+ event types for different entities and actions
- **Rooms**: Per-entity rooms for targeted broadcasts
- **User Tracking**: Multi-device session management

## WebSocket Setup

### Backend Integration

```typescript
// main.ts - NestJS App Setup
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup WebSocket with Socket.io
  app.useWebSocketAdapter(new IoAdapter());

  await app.listen(3000);
}

bootstrap();
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { WebSocketModule } from '@diet/infrastructure';
import { DietPlanController } from './diet-plan.controller';

@Module({
  imports: [WebSocketModule, ...otherModules],
  controllers: [DietPlanController],
})
export class AppModule {}
```

### Frontend Connection

```typescript
// pages/_app.tsx or layout.tsx
'use client';

import { useWebSocket } from '@diet/shared';
import { useAuth } from '@/hooks/useAuth';

export function RootLayout({ children }) {
  const { user, token } = useAuth();
  const { ws, isConnected } = useWebSocket(token!, !!user);

  return (
    <html>
      <body>
        {/* Connection indicator */}
        <div className={`fixed top-4 right-4 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        {children}
      </body>
    </html>
  );
}
```

## Dashboard Pages

### 1. Meals Dashboard

**Features:**
- List all meals with pagination
- Real-time updates when meals are created/updated/deleted
- Filter by diet plan and search
- Quick actions (edit, delete)
- Nutrition info display (calories, macros)

```typescript
// Implementation features:
// - useWebSocketInvalidation for auto-refresh
// - Real-time meal status updates
// - Pagination with limit selector
```

### 2. Metrics Dashboard

**Features:**
- Weight trend charts (7d, 30d, 90d views)
- Summary statistics (BMI, current weight, streaks)
- Latest metric notifications
- Historical data visualization
- Real-time metric updates via WebSocket

```typescript
interface MetricPoint {
  date: string;
  value: number;
  unit: string;
}

// Real-time metric notifications
useWebSocketEvent(WebSocketEventType.METRIC_CREATED, (metric) => {
  // Update latest metric display
});
```

### 3. Appointments Dashboard

**Features:**
- Schedule appointments with nutritionists
- Filter (upcoming, past, all)
- Appointment reminders via WebSocket
- Browser notifications for reminders
- Reschedule/cancel functionality

```typescript
// Browser notification for appointment reminder
useWebSocketEvent(WebSocketEventType.APPOINTMENT_REMINDER, (reminder) => {
  if (Notification.permission === 'granted') {
    new Notification('Appointment Reminder', {
      body: `${reminder.title} in ${reminder.reminderMinutesBefore} minutes`
    });
  }
});
```

### 4. Foods Dashboard

**Features:**
- Browse food database with pagination
- Filter by category (vegetables, fruits, proteins, grains)
- Real-time search
- Nutrition information per 100g
- Create/edit/delete custom foods

## WebSocket Event Types

### Entity Updates
```typescript
DIET_PLAN_CREATED    // New diet plan created
DIET_PLAN_UPDATED    // Diet plan updated
DIET_PLAN_DELETED    // Diet plan deleted

MEAL_CREATED         // New meal created
MEAL_UPDATED         // Meal updated
MEAL_DELETED         // Meal deleted

FOOD_CREATED         // New food item added
FOOD_UPDATED         // Food item updated
FOOD_DELETED         // Food item deleted

NUTRITION_LOG_CREATED
NUTRITION_LOG_UPDATED
NUTRITION_LOG_DELETED

METRIC_CREATED       // Weight or metric logged
METRIC_UPDATED       // Metric updated

APPOINTMENT_CREATED
APPOINTMENT_UPDATED
APPOINTMENT_REMINDER // Appointment reminder
```

### System Events
```typescript
CONNECT              // Heartbeat/ping
DISCONNECT           // User disconnected
AUTHENTICATE         // Authentication complete

NOTIFICATION         // General notifications
ALERT                // Important alerts
WARNING              // Warning messages

USER_ONLINE          // User came online
USER_OFFLINE         // User went offline
```

## Real-Time Hooks

### useWebSocket
```typescript
const { ws, isConnected, isAuthenticated } = useWebSocket(token);

// Direct WebSocket access
if (isConnected) {
  ws.send({
    event: WebSocketEventType.CONNECT,
    data: { custom: 'data' }
  });
}
```

### useWebSocketEvent
```typescript
useWebSocketEvent(WebSocketEventType.MEAL_UPDATED, (mealData) => {
  // Handle meal update
  console.log('Meal updated:', mealData);
});
```

### useWebSocketDataSync
```typescript
// Auto-sync query data when WebSocket event received
useWebSocketDataSync(
  ['meals', userId],
  WebSocketEventType.MEAL_UPDATED,
  true // enabled
);
```

### useWebSocketInvalidation
```typescript
// Invalidate React Query and refetch
useWebSocketInvalidation(
  WebSocketEventType.MEAL_CREATED,
  ['meals'],
  true // enabled
);
```

## Backend Broadcasting

### From Services

```typescript
import { AppWebSocketGateway } from '@diet/infrastructure';

@Injectable()
export class MealService {
  constructor(private ws: AppWebSocketGateway) {}

  async createMeal(dto: CreateMealDto, userId: string) {
    const meal = await this.prisma.meal.create({
      data: { ...dto, userId }
    });

    // Broadcast to user
    this.ws.broadcastToUser(userId, WebSocketEventType.MEAL_CREATED, meal);

    // Broadcast to diet plan room
    this.ws.broadcastToRoom(
      `diet-plan:${meal.dietPlanId}`,
      WebSocketEventType.MEAL_CREATED,
      meal
    );

    return meal;
  }

  async updateMeal(mealId: string, dto: UpdateMealDto) {
    const meal = await this.prisma.meal.update({
      where: { id: mealId },
      data: dto
    });

    this.ws.broadcastMealUpdate(mealId, meal);
    return meal;
  }
}
```

### From Controllers

```typescript
@Controller('api/meals')
export class MealController {
  constructor(
    private service: MealService,
    private ws: AppWebSocketGateway
  ) {}

  @Post()
  async createMeal(
    @Body() dto: CreateMealDto,
    @CurrentUser() user: User
  ) {
    const meal = await this.service.createMeal(dto, user.id);
    
    // Or broadcast directly from controller
    this.ws.broadcastToUser(user.id, WebSocketEventType.MEAL_CREATED, meal);
    
    return meal;
  }
}
```

## Advanced Features

### Appointment Reminders

```typescript
@Injectable()
export class AppointmentReminderService {
  @Cron('every 1 minute')
  async sendReminders() {
    const upcoming = await this.prisma.appointment.findMany({
      where: {
        scheduledTime: {
          gte: new Date(),
          lte: addMinutes(new Date(), 60)
        },
        reminderSent: false
      }
    });

    for (const apt of upcoming) {
      const minutesUntil = differenceInMinutes(
        new Date(apt.scheduledTime),
        new Date()
      );

      if (minutesUntil === apt.reminderMinutes) {
        this.ws.broadcastAppointmentReminder(apt.userId, {
          appointmentId: apt.id,
          title: apt.title,
          reminderMinutesBefore: apt.reminderMinutes
        });

        // Mark as sent
        await this.prisma.appointment.update({
          where: { id: apt.id },
          data: { reminderSent: true }
        });
      }
    }
  }
}
```

### Streak Updates

```typescript
// When user logs meals/metrics
async logMeal(mealId: string, userId: string) {
  // ... meal logging logic ...

  // Update streak
  const streak = await this.updateStreak(userId);

  // Broadcast streak update
  this.ws.broadcastToUser(userId, WebSocketEventType.STREAK_UPDATE, {
    streakType: 'LOGGING',
    currentStreak: streak.current,
    longestStreak: streak.longest,
    milestone: streak.milestone
  });
}
```

## Best Practices

1. **Always Authenticate**
   - Token sent on connection
   - User ID validated before broadcasting
   - Reject unauthenticated messages

2. **Room Management**
   - Use room names like `user:{userId}`, `diet-plan:{planId}`
   - Subscribe to relevant rooms on login
   - Unsubscribe on logout

3. **Error Handling**
   - Use `useWebSocketEvent` with error boundaries
   - Log connection failures
   - Implement reconnection with exponential backoff

4. **Performance**
   - Batch updates where possible
   - Debounce frequent updates
   - Don't broadcast sensitive data unnecessarily

5. **Testing**
   - Mock WebSocket service in tests
   - Test event handlers independently
   - Verify broadcasting without live connection

## Troubleshooting

### Connection Issues
- Check CORS configuration
- Verify JWT token validity
- Check WebSocket URL environment variable
- Review browser console for errors

### Missing Updates
- Verify event subscription
- Check that user is in correct rooms
- Ensure backend is broadcasting correctly
- Check network tab in DevTools

### Stale Data
- Use `useWebSocketInvalidation` to force refresh
- Combine WebSocket with React Query
- Implement optimistic updates

## Configuration

### Environment Variables

```bash
# Frontend
REACT_APP_WS_URL=ws://localhost:3000/ws
REACT_APP_API_URL=http://localhost:3000/api

# Backend
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
WS_PING_INTERVAL=30000
WS_RECONNECT_INTERVAL=3000
```

### Socket.io Options

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(','),
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  pingInterval: 30000,
  pingTimeout: 15000,
  maxHttpBufferSize: 1e6,
})
```

## See Also

- [ADVANCED_AUTH.md](./ADVANCED_AUTH.md) - Authentication setup
- [PAGINATION.md](./PAGINATION.md) - Pagination implementation
- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Error handling patterns
