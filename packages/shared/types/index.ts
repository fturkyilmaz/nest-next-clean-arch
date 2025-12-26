/**
 * Shared Type Definitions
 * Central location for all API types used across web, mobile, and backend
 */

// ============================================
// Response & Error Types
// ============================================

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    getAccessToken?: () => string | null;
    onTokenExpired?: () => void;
    onError?: (error: ApiError) => void;
}

/**
 * Standardized API Error Response (RFC 7807 Problem Details)
 */
export interface ApiError {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    timestamp?: string;
    errors?: Record<string, string[]>;
    code?: string; // Custom error code for i18n
}

/**
 * Paginated Response Wrapper
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Pagination Query Parameters
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

/**
 * Filter Query Parameters (flexible for any endpoint)
 */
export interface FilterParams {
    [key: string]: string | number | boolean | string[] | undefined;
}

// ============================================
// User Related Types
// ============================================

export enum UserRole {
    ADMIN = 'ADMIN',
    DIETITIAN = 'DIETITIAN',
    CLIENT = 'CLIENT',
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CreateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserInput {
    firstName?: string;
    lastName?: string;
    password?: string;
}

export interface UserProfile extends User {
    clientsCount?: number;
}

// ============================================
// Authentication Types
// ============================================

export interface LoginCredentials {
    email: string;
    password: string;
    // For 2FA
    totp?: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TwoFactorSetupResponse {
    qrCode: string;
    secret: string;
    backupCodes: string[];
}

export interface TwoFactorVerifyInput {
    token: string;
    code: string;
}

// ============================================
// Client Related Types
// ============================================

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: Gender;
    dietitianId: string;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CreateClientInput {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: Gender;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    notes?: string;
}

export interface UpdateClientInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: Gender;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    notes?: string;
}

// ============================================
// Diet Plan Related Types
// ============================================

export interface DietPlan {
    id: string;
    clientId: string;
    dietitianId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate?: string;
    status: DietPlanStatus;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
    targetFiber?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CreateDietPlanInput {
    clientId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate?: string;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
    targetFiber?: number;
}

export interface UpdateDietPlanInput {
    name?: string;
    description?: string;
    endDate?: string;
    status?: DietPlanStatus;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
    targetFiber?: number;
}

// ============================================
// Meal Related Types
// ============================================

export enum MealType {
    BREAKFAST = 'BREAKFAST',
    LUNCH = 'LUNCH',
    DINNER = 'DINNER',
    SNACK = 'SNACK',
}

export interface Meal {
    id: string;
    dietPlanId: string;
    name: string;
    mealType: MealType;
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    foods?: FoodItem[];
}

export interface CreateMealInput {
    dietPlanId: string;
    name: string;
    mealType: MealType;
    date: string;
    notes?: string;
}

export interface UpdateMealInput {
    name?: string;
    mealType?: MealType;
    date?: string;
    notes?: string;
}

// ============================================
// Food Related Types
// ============================================

export interface FoodItem {
    id: string;
    name: string;
    brand?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    barcode?: string;
    mealId?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CreateFoodInput {
    name: string;
    brand?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    barcode?: string;
}

export interface UpdateFoodInput {
    name?: string;
    brand?: string;
    servingSize?: number;
    servingUnit?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
}

// ============================================
// Metrics Related Types
// ============================================

export interface ClientMetrics {
    id: string;
    clientId: string;
    weight: number;
    height: number;
    bodyFat?: number;
    waist?: number;
    hip?: number;
    bmi: number;
    notes?: string;
    recordedAt: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CreateMetricsInput {
    clientId: string;
    weight: number;
    height: number;
    bodyFat?: number;
    waist?: number;
    hip?: number;
    notes?: string;
    recordedAt?: string;
}

export interface UpdateMetricsInput {
    weight?: number;
    height?: number;
    bodyFat?: number;
    waist?: number;
    hip?: number;
    notes?: string;
}

// ============================================
// Appointment Related Types
// ============================================

export interface Appointment {
    id: string;
    clientId: string;
    dietitianId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CreateAppointmentInput {
    clientId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

export interface UpdateAppointmentInput {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    status?: AppointmentStatus;
    notes?: string;
}

// ============================================
// Audit Log Types
// ============================================

export enum AuditAction {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
}

export interface AuditLog {
    id: string;
    userId: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

// ============================================
// Report Types
// ============================================

export interface ClientProgressReport {
    clientId: string;
    startDate: string;
    endDate: string;
    initialMetrics?: ClientMetrics;
    currentMetrics?: ClientMetrics;
    weightChange: number;
    bmiChange: number;
    averageCalories: number;
    adherenceRate: number;
}

export interface NutritionSummary {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
    date: string;
}

// ============================================
// Event Types (Domain Events)
// ============================================

export interface DomainEvent {
    id: string;
    type: string;
    aggregateId: string;
    aggregateType: string;
    timestamp: string;
    data: Record<string, any>;
    version: number;
}

export interface ClientCreatedEvent extends DomainEvent {
    data: {
        clientId: string;
        dietitianId: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface DietPlanCreatedEvent extends DomainEvent {
    data: {
        dietPlanId: string;
        clientId: string;
        name: string;
        startDate: string;
    };
}

// ============================================
// Sync & Offline Types (for Mobile)
// ============================================

export enum SyncActionType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export interface OfflineSyncAction {
    id: string;
    type: SyncActionType;
    entityType: string;
    entityId?: string;
    payload: any;
    timestamp: number;
    isSync: boolean;
}

export interface SyncConflict {
    entityType: string;
    entityId: string;
    localVersion: any;
    serverVersion: any;
    resolutionStrategy: 'LOCAL_WINS' | 'SERVER_WINS' | 'MANUAL';
}


export const Role = {
  ADMIN: 'ADMIN',
  DIETITIAN: 'DIETITIAN',
  CLIENT: 'CLIENT'
} as const

export type Role = (typeof Role)[keyof typeof Role]


export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
} as const

export type Gender = (typeof Gender)[keyof typeof Gender]


export const DietPlanStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export type DietPlanStatus = (typeof DietPlanStatus)[keyof typeof DietPlanStatus]


export const DayOfWeek = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY'
} as const

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek]


export const TimeOfDay = {
  BREAKFAST: 'BREAKFAST',
  MORNING_SNACK: 'MORNING_SNACK',
  LUNCH: 'LUNCH',
  AFTERNOON_SNACK: 'AFTERNOON_SNACK',
  DINNER: 'DINNER',
  EVENING_SNACK: 'EVENING_SNACK'
} as const

export type TimeOfDay = (typeof TimeOfDay)[keyof typeof TimeOfDay]


export const FoodCategory = {
  VEGETABLES: 'VEGETABLES',
  FRUITS: 'FRUITS',
  GRAINS: 'GRAINS',
  PROTEIN: 'PROTEIN',
  DAIRY: 'DAIRY',
  FATS_OILS: 'FATS_OILS',
  BEVERAGES: 'BEVERAGES',
  SNACKS: 'SNACKS',
  CONDIMENTS: 'CONDIMENTS',
  OTHER: 'OTHER'
} as const

export type FoodCategory = (typeof FoodCategory)[keyof typeof FoodCategory]


export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
} as const

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus]
