# WebSocket & Dashboard Implementation Examples

Complete working examples for WebSocket integration and dashboard implementations.

## Example 1: Real-Time Meal Updates

### Backend Service

```typescript
// meal.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@diet/infrastructure';
import { AppWebSocketGateway } from '@diet/infrastructure';
import { WebSocketEventType } from '@diet/shared';

@Injectable()
export class MealService {
  constructor(
    private prisma: PrismaService,
    private ws: AppWebSocketGateway,
  ) {}

  async createMeal(dto: CreateMealDto, userId: string) {
    const meal = await this.prisma.meal.create({
      data: {
        ...dto,
        userId,
        createdAt: new Date(),
      },
    });

    // Broadcast to user
    this.ws.broadcastToUser(userId, WebSocketEventType.MEAL_CREATED, meal);

    // Broadcast to diet plan subscribers
    this.ws.broadcastToRoom(`diet-plan:${meal.dietPlanId}`, WebSocketEventType.MEAL_CREATED, {
      ...meal,
      timestamp: Date.now(),
    });

    return meal;
  }

  async updateMeal(mealId: string, dto: UpdateMealDto, userId: string) {
    const oldMeal = await this.prisma.meal.findUnique({
      where: { id: mealId },
    });

    const meal = await this.prisma.meal.update({
      where: { id: mealId },
      data: dto,
    });

    // Broadcast update with change info
    this.ws.broadcastToUser(userId, WebSocketEventType.MEAL_UPDATED, {
      ...meal,
      changes: {
        name: { old: oldMeal?.name, new: meal.name },
        status: { old: oldMeal?.status, new: meal.status },
      },
    });

    return meal;
  }

  async deleteMeal(mealId: string, userId: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: mealId },
    });

    await this.prisma.meal.delete({
      where: { id: mealId },
    });

    this.ws.broadcastToUser(userId, WebSocketEventType.MEAL_DELETED, {
      mealId,
      dietPlanId: meal?.dietPlanId,
    });
  }

  async getMeals(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    dietPlanId?: string,
  ) {
    const where: any = { userId };

    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    if (dietPlanId) {
      where.dietPlanId = dietPlanId;
    }

    const [meals, total] = await Promise.all([
      this.prisma.meal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.meal.count({ where }),
    ]);

    return {
      data: meals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

### Backend Controller

```typescript
// meal.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { MealService } from './meal.service';

@Controller('api/meals')
export class MealController {
  constructor(private service: MealService) {}

  @Post()
  async createMeal(@Body() dto: CreateMealDto, @CurrentUser() user: User) {
    return this.service.createMeal(dto, user.id);
  }

  @Patch(':id')
  async updateMeal(
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
    @CurrentUser() user: User,
  ) {
    return this.service.updateMeal(id, dto, user.id);
  }

  @Delete(':id')
  async deleteMeal(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.deleteMeal(id, user.id);
  }

  @Get()
  async getMeals(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('dietPlanId') dietPlanId?: string,
    @CurrentUser() user: User,
  ) {
    return this.service.getMeals(user.id, page, limit, search, dietPlanId);
  }
}
```

### Frontend Component

```typescript
// meals/page.tsx (as shown in main implementation)
// Uses:
// - useQuery for data fetching
// - useWebSocketInvalidation for real-time updates
// - useMutation for mutations
// - PaginationControls for pagination
```

## Example 2: Metrics Dashboard with Charts

```typescript
// metrics.service.ts
@Injectable()
export class MetricsService {
  constructor(
    private prisma: PrismaService,
    private ws: AppWebSocketGateway,
  ) {}

  async logMetric(dto: LogMetricDto, userId: string) {
    const metric = await this.prisma.metric.create({
      data: {
        ...dto,
        userId,
        recordedAt: new Date(),
      },
    });

    // Get previous metric for comparison
    const previousMetric = await this.prisma.metric.findFirst({
      where: {
        userId,
        type: dto.type,
        recordedAt: { lt: metric.recordedAt },
      },
      orderBy: { recordedAt: 'desc' },
    });

    // Calculate change
    const change = previousMetric
      ? {
          amount: metric.value - previousMetric.value,
          percentage: ((metric.value - previousMetric.value) / previousMetric.value) * 100,
        }
      : null;

    // Broadcast with change info
    this.ws.broadcastMetricsUpdate(userId, {
      ...metric,
      previousValue: previousMetric?.value,
      change,
    });

    // Check for milestone (e.g., weight loss goal)
    if (this.isMilestone(previousMetric, metric)) {
      this.ws.broadcastNotification(userId, {
        type: 'SUCCESS',
        title: 'Milestone Reached!',
        message: `Congratulations! You've hit a milestone!`,
      });
    }

    // Update streak
    await this.updateLoggingStreak(userId);

    return metric;
  }

  async getMetricsTimeline(
    userId: string,
    type: string,
    days = 30,
  ): Promise<MetricPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.prisma.metric.findMany({
      where: {
        userId,
        type,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
    });

    return metrics.map((m) => ({
      date: m.recordedAt.toISOString().split('T')[0],
      value: m.value,
      unit: m.unit,
    }));
  }

  async getMetricsSummary(userId: string) {
    const currentMetric = await this.prisma.metric.findFirst({
      where: { userId, type: 'WEIGHT' },
      orderBy: { recordedAt: 'desc' },
    });

    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const monthAgoMetric = await this.prisma.metric.findFirst({
      where: {
        userId,
        type: 'WEIGHT',
        recordedAt: { lte: previousMonth },
      },
      orderBy: { recordedAt: 'desc' },
    });

    const weightChange = monthAgoMetric
      ? currentMetric?.value! - monthAgoMetric.value
      : null;

    // Calculate BMI
    const bmi = this.calculateBMI(currentMetric?.value || 0, userId);

    // Get nutrition logs average
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const nutritionLogs = await this.prisma.nutritionLog.findMany({
      where: {
        userId,
        createdAt: { gte: lastWeek },
      },
    });

    const avgCalories = nutritionLogs.length > 0
      ? nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0) /
        nutritionLogs.length
      : 0;

    return {
      currentWeight: currentMetric?.value,
      weightChange,
      bmi: bmi?.toFixed(1),
      bmiCategory: this.getBMICategory(bmi),
      avgCalories: Math.round(avgCalories),
      streak: await this.getLoggingStreak(userId),
      longestStreak: await this.getLongestStreak(userId),
    };
  }

  private isMilestone(prev: any, current: any): boolean {
    if (!prev) return false;
    // Check if weight loss milestone (e.g., every 5kg)
    return prev.value % 5 === 0 && current.value < prev.value;
  }

  private calculateBMI(weight: number, userId: string): number {
    // Simplified - would fetch height from user profile
    const height = 1.75; // Default height
    return weight / (height * height);
  }

  private getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  private async updateLoggingStreak(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metricsToday = await this.prisma.metric.findFirst({
      where: {
        userId,
        recordedAt: { gte: today },
      },
    });

    if (metricsToday) {
      // User already logged today
      const streak = await this.getLoggingStreak(userId);
      this.ws.broadcastToUser(userId, WebSocketEventType.STREAK_UPDATE, {
        streakType: 'LOGGING',
        currentStreak: streak,
        lastActivityDate: new Date(),
      });
    }
  }

  private async getLoggingStreak(userId: string): Promise<number> {
    // Get all logged days
    const logs = await this.prisma.metric.findMany({
      where: { userId },
      select: { recordedAt: true },
      orderBy: { recordedAt: 'desc' },
      distinct: ['recordedAt'],
    });

    // Count consecutive days
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of logs) {
      const logDate = new Date(log.recordedAt);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (logDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private async getLongestStreak(userId: string): Promise<number> {
    const logs = await this.prisma.metric.findMany({
      where: { userId },
      select: { recordedAt: true },
      orderBy: { recordedAt: 'asc' },
      distinct: ['recordedAt'],
    });

    let maxStreak = 0;
    let currentStreak = 1;
    let prevDate: Date | null = null;

    for (const log of logs) {
      const logDate = new Date(log.recordedAt);
      logDate.setHours(0, 0, 0, 0);

      if (prevDate) {
        const prevDateNorm = new Date(prevDate);
        prevDateNorm.setHours(0, 0, 0, 0);

        const daysDiff = (logDate.getTime() - prevDateNorm.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }

      prevDate = logDate;
    }

    return Math.max(maxStreak, currentStreak);
  }
}
```

## Example 3: Appointment Reminders

```typescript
// appointment-reminder.service.ts
@Injectable()
export class AppointmentReminderService {
  constructor(
    private prisma: PrismaService,
    private ws: AppWebSocketGateway,
  ) {}

  @Cron('0 * * * * *') // Every minute
  async sendReminders() {
    const now = new Date();

    // Find appointments within next hour
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledTime: {
          gte: now,
          lte: addHours(now, 1),
        },
        reminderSent: false,
      },
      include: { user: true },
    });

    for (const apt of appointments) {
      const minutesUntil = differenceInMinutes(apt.scheduledTime, now);

      // Check if it's time to send reminder
      if (minutesUntil === apt.reminderMinutes) {
        this.ws.broadcastAppointmentReminder(apt.userId, {
          appointmentId: apt.id,
          title: apt.title,
          scheduledTime: apt.scheduledTime,
          reminderMinutesBefore: apt.reminderMinutes,
          notes: apt.notes,
        });

        // Mark as sent
        await this.prisma.appointment.update({
          where: { id: apt.id },
          data: { reminderSent: true },
        });

        // Also send email notification
        await this.sendEmailReminder(apt.user.email, apt);
      }
    }
  }

  private async sendEmailReminder(email: string, apt: any) {
    // Send email via your email service
    // Example: await this.emailService.send({...})
  }

  async getUpcomingAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: {
        userId,
        status: 'SCHEDULED',
        scheduledTime: { gte: new Date() },
      },
      orderBy: { scheduledTime: 'asc' },
    });
  }

  async getPastAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: {
        userId,
        scheduledTime: { lt: new Date() },
      },
      orderBy: { scheduledTime: 'desc' },
      take: 20,
    });
  }

  async rescheduleAppointment(
    appointmentId: string,
    newTime: Date,
    userId: string,
  ) {
    const apt = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledTime: newTime,
        reminderSent: false,
      },
    });

    // Broadcast update
    this.ws.broadcastToUser(userId, WebSocketEventType.APPOINTMENT_UPDATED, apt);

    return apt;
  }

  async cancelAppointment(appointmentId: string, userId: string) {
    const apt = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    this.ws.broadcastToUser(userId, WebSocketEventType.APPOINTMENT_UPDATED, apt);

    return apt;
  }
}
```

## Example 4: React Query Integration

```typescript
// hooks/useRealtimeMeals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocketInvalidation } from '@diet/shared';
import { WebSocketEventType } from '@diet/shared';
import { apiClient } from '@/lib/api-client';

export function useRealtimeMeals(
  userId: string,
  page = 1,
  limit = 10,
  search = '',
) {
  const queryClient = useQueryClient();
  const queryKey = ['meals', userId, page, limit, search];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await apiClient.get('/api/meals', {
        params: { page, limit, search: search || undefined },
      });
      return res.data;
    },
    enabled: !!userId,
  });

  // Real-time updates
  useWebSocketInvalidation(WebSocketEventType.MEAL_CREATED, queryKey);
  useWebSocketInvalidation(WebSocketEventType.MEAL_UPDATED, queryKey);
  useWebSocketInvalidation(WebSocketEventType.MEAL_DELETED, queryKey);

  // Create meal mutation
  const createMutation = useMutation({
    mutationFn: (dto: CreateMealDto) => apiClient.post('/api/meals', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update meal mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; dto: UpdateMealDto }) =>
      apiClient.patch(`/api/meals/${data.id}`, data.dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete meal mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/meals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    meals: query.data?.data || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createMeal: createMutation.mutate,
    updateMeal: updateMutation.mutate,
    deleteMeal: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

These examples show complete real-time implementations across backend services, controllers, frontend components, and React Query integration.
