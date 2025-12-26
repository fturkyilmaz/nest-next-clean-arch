/**
 * WebSocket Event Types
 *
 * Type definitions for real-time WebSocket events and data synchronization.
 * Supports entity updates, notifications, and live metrics.
 */

export enum WebSocketEventType {
  // Connection events
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  AUTHENTICATE = 'AUTHENTICATE',

  // Entity updates (real-time sync)
  DIET_PLAN_CREATED = 'DIET_PLAN_CREATED',
  DIET_PLAN_UPDATED = 'DIET_PLAN_UPDATED',
  DIET_PLAN_DELETED = 'DIET_PLAN_DELETED',

  MEAL_CREATED = 'MEAL_CREATED',
  MEAL_UPDATED = 'MEAL_UPDATED',
  MEAL_DELETED = 'MEAL_DELETED',

  FOOD_CREATED = 'FOOD_CREATED',
  FOOD_UPDATED = 'FOOD_UPDATED',
  FOOD_DELETED = 'FOOD_DELETED',

  NUTRITION_LOG_CREATED = 'NUTRITION_LOG_CREATED',
  NUTRITION_LOG_UPDATED = 'NUTRITION_LOG_UPDATED',
  NUTRITION_LOG_DELETED = 'NUTRITION_LOG_DELETED',

  METRIC_CREATED = 'METRIC_CREATED',
  METRIC_UPDATED = 'METRIC_UPDATED',
  METRIC_DELETED = 'METRIC_DELETED',

  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED = 'APPOINTMENT_UPDATED',
  APPOINTMENT_DELETED = 'APPOINTMENT_DELETED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',

  // Notifications
  NOTIFICATION = 'NOTIFICATION',
  ALERT = 'ALERT',
  WARNING = 'WARNING',

  // Metrics and analytics
  METRICS_UPDATE = 'METRICS_UPDATE',
  ANALYTICS_UPDATE = 'ANALYTICS_UPDATE',
  STREAK_UPDATE = 'STREAK_UPDATE',

  // Collaboration
  USER_ONLINE = 'USER_ONLINE',
  USER_OFFLINE = 'USER_OFFLINE',

  // Errors
  ERROR = 'ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_EVENT = 'INVALID_EVENT',
}

export interface WebSocketMessage<T = any> {
  event: WebSocketEventType;
  data: T;
  timestamp: number;
  requestId?: string;
}

export interface WebSocketErrorMessage {
  event: WebSocketEventType.ERROR;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
  requestId?: string;
}

// Entity update payloads
export interface EntityUpdatePayload<T> {
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  entity: T;
  changes?: Record<string, { old: any; new: any }>;
  userId: string;
  timestamp: Date;
}

export interface MealUpdatePayload {
  mealId: string;
  dietPlanId: string;
  name: string;
  description?: string;
  scheduledTime: Date;
  foods?: Array<{ foodId: string; quantity: number; unit: string }>;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  status: 'PLANNED' | 'LOGGED' | 'COMPLETED';
}

export interface MetricUpdatePayload {
  metricId: string;
  userId: string;
  type: 'WEIGHT' | 'BODY_MEASUREMENT' | 'BIOMARKER';
  value: number;
  unit: string;
  recordedAt: Date;
  previousValue?: number;
  change?: {
    amount: number;
    percentage: number;
  };
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AppointmentReminderPayload {
  appointmentId: string;
  userId: string;
  title: string;
  scheduledTime: Date;
  reminderMinutesBefore: number;
  notes?: string;
}

export interface StreakUpdatePayload {
  userId: string;
  streakType: 'LOGGING' | 'WORKOUT' | 'MEALS';
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  milestone?: boolean;
}

export interface MetricsUpdatePayload {
  userId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  totalLogged: number;
  averageCalories: number;
  averageMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  complianceScore: number;
}

export interface OnlineStatusPayload {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
  sessionId?: string;
}

// Subscription types
export interface WebSocketSubscription {
  userId: string;
  rooms: string[];
  filters?: {
    entityType?: string[];
    action?: string[];
  };
}

export interface WebSocketRoom {
  roomId: string;
  name: string;
  subscribers: string[];
  createdAt: Date;
}

// Connection state
export interface WebSocketConnectionState {
  userId?: string;
  sessionId: string;
  isAuthenticated: boolean;
  isConnected: boolean;
  subscriptions: string[];
  reconnectAttempts: number;
  lastHeartbeat: number;
}
