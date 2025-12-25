/**
 * Shared Zod Validation Schemas
 * Single source of truth for form and API request validation
 * Used by web app, mobile app, and backend
 */

import { z } from 'zod';
import { DietPlanStatus, Gender, Role } from './enums';
import { AppointmentStatus, MealType } from '../types';

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    totp: z.string().optional(),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        firstName: z.string().min(1, 'First name is required').max(100),
        lastName: z.string().min(1, 'Last name is required').max(100),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type RegisterFormInputs = z.infer<typeof registerSchema>;

export const twoFactorVerifySchema = z.object({
    code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
});

export type TwoFactorVerifyInputs = z.infer<typeof twoFactorVerifySchema>;

// ============================================
// User Schemas
// ============================================

export const createUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum([Role.ADMIN, Role.DIETITIAN, Role.CLIENT]),
});

export type CreateUserFormInputs = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100).optional(),
    lastName: z.string().min(1, 'Last name is required').max(100).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export type UpdateUserFormInputs = z.infer<typeof updateUserSchema>;

// ============================================
// Client Schemas
// ============================================

export const createClientSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[+]?[0-9\s\-()]+$/, 'Invalid phone number').optional().or(z.literal('')),
    dateOfBirth: z.string().datetime().optional().or(z.literal('')),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
    allergies: z
        .string()
        .transform((val) => (val ? val.split(',').map((v) => v.trim()) : []))
        .optional(),
    conditions: z
        .string()
        .transform((val) => (val ? val.split(',').map((v) => v.trim()) : []))
        .optional(),
    medications: z
        .string()
        .transform((val) => (val ? val.split(',').map((v) => v.trim()) : []))
        .optional(),
    notes: z.string().max(1000).optional(),
});

export type CreateClientFormInputs = z.infer<typeof createClientSchema>;

export const updateClientSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100).optional(),
    lastName: z.string().min(1, 'Last name is required').max(100).optional(),
    phone: z.string().regex(/^[+]?[0-9\s\-()]+$/, 'Invalid phone number').optional().or(z.literal('')),
    dateOfBirth: z.string().datetime().optional().or(z.literal('')),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
    allergies: z
        .string()
        .transform((val) => (val ? val.split(',').map((v) => v.trim()) : []))
        .optional(),
    conditions: z
        .string()
        .transform((val) => (val ? val.split(',').map((v) => v.trim()) : []))
        .optional(),
    medications: z
        .string()
        .transform((val) => (val ? val.split(',').map((v) => v.trim()) : []))
        .optional(),
    notes: z.string().max(1000).optional(),
});

export type UpdateClientFormInputs = z.infer<typeof updateClientSchema>;

// ============================================
// Metrics Schemas
// ============================================

export const addClientMetricsSchema = z.object({
    weight: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) < 500, {
            message: 'Weight must be a positive number less than 500 kg',
        }),
    height: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) < 300, {
            message: 'Height must be a positive number less than 300 cm',
        }),
    bodyFat: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100), {
            message: 'Body fat percentage must be between 0 and 100',
        })
        .optional(),
    waist: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Waist must be a positive number',
        })
        .optional(),
    hip: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Hip must be a positive number',
        })
        .optional(),
    notes: z.string().max(500).optional(),
    recordedAt: z.string().datetime().optional(),
});

export type AddClientMetricsFormInputs = z.infer<typeof addClientMetricsSchema>;

// ============================================
// Diet Plan Schemas
// ============================================

export const createDietPlanSchema = z.object({
    clientId: z.string().min(1, 'Client is required').uuid(),
    name: z.string().min(1, 'Plan name is required').max(200),
    description: z.string().max(1000).optional(),
    startDate: z.string().datetime('Invalid date format'),
    endDate: z.string().datetime('Invalid date format').optional(),
    status: z.enum([DietPlanStatus.ACTIVE, DietPlanStatus.INACTIVE, DietPlanStatus.ARCHIVED]).optional(),
    targetCalories: z
        .string()
        .refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0), {
            message: 'Target calories must be a positive number',
        })
        .optional(),
    targetProtein: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Target protein must be a positive number',
        })
        .optional(),
    targetCarbs: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Target carbs must be a positive number',
        })
        .optional(),
    targetFat: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Target fat must be a positive number',
        })
        .optional(),
    targetFiber: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Target fiber must be a positive number',
        })
        .optional(),
});

export type CreateDietPlanFormInputs = z.infer<typeof createDietPlanSchema>;

export const updateDietPlanSchema = z.object({
    name: z.string().min(1, 'Plan name is required').max(200).optional(),
    description: z.string().max(1000).optional(),
    endDate: z.string().datetime('Invalid date format').optional(),
    status: z.enum([DietPlanStatus.ACTIVE, DietPlanStatus.DRAFT, DietPlanStatus.COMPLETED, DietPlanStatus.CANCELLED]).optional(),
    targetCalories: z
        .string()
        .refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0), {
            message: 'Target calories must be a positive number',
        })
        .optional(),
    targetProtein: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Target protein must be a positive number',
        })
        .optional(),
    targetCarbs: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Target carbs must be a positive number',
        })
        .optional(),
    targetFat: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Target fat must be a positive number',
        })
        .optional(),
    targetFiber: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Target fiber must be a positive number',
        })
        .optional(),
});

export type UpdateDietPlanFormInputs = z.infer<typeof updateDietPlanSchema>;

// ============================================
// Meal Schemas
// ============================================

export const createMealSchema = z.object({
    dietPlanId: z.string().min(1, 'Diet plan is required').uuid(),
    name: z.string().min(1, 'Meal name is required').max(200),
    mealType: z.enum([MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK]),
    date: z.string().datetime('Invalid date format'),
    notes: z.string().max(500).optional(),
});

export type CreateMealFormInputs = z.infer<typeof createMealSchema>;

export const updateMealSchema = z.object({
    name: z.string().min(1, 'Meal name is required').max(200).optional(),
    mealType: z.enum([MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK]).optional(),
    date: z.string().datetime('Invalid date format').optional(),
    notes: z.string().max(500).optional(),
});

export type UpdateMealFormInputs = z.infer<typeof updateMealSchema>;

// ============================================
// Food Schemas
// ============================================

export const createFoodSchema = z.object({
    name: z.string().min(1, 'Food name is required').max(200),
    brand: z.string().max(200).optional(),
    servingSize: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Serving size must be a positive number',
        }),
    servingUnit: z.string().min(1, 'Serving unit is required').max(50),
    calories: z
        .string()
        .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
            message: 'Calories must be a non-negative number',
        }),
    protein: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
            message: 'Protein must be a non-negative number',
        }),
    carbs: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
            message: 'Carbs must be a non-negative number',
        }),
    fat: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
            message: 'Fat must be a non-negative number',
        }),
    fiber: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
            message: 'Fiber must be a non-negative number',
        }),
    barcode: z.string().optional(),
});

export type CreateFoodFormInputs = z.infer<typeof createFoodSchema>;

export const updateFoodSchema = z.object({
    name: z.string().min(1, 'Food name is required').max(200).optional(),
    brand: z.string().max(200).optional(),
    servingSize: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
            message: 'Serving size must be a positive number',
        })
        .optional(),
    servingUnit: z.string().max(50).optional(),
    calories: z
        .string()
        .refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0), {
            message: 'Calories must be a non-negative number',
        })
        .optional(),
    protein: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
            message: 'Protein must be a non-negative number',
        })
        .optional(),
    carbs: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
            message: 'Carbs must be a non-negative number',
        })
        .optional(),
    fat: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
            message: 'Fat must be a non-negative number',
        })
        .optional(),
    fiber: z
        .string()
        .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
            message: 'Fiber must be a non-negative number',
        })
        .optional(),
});

export type UpdateFoodFormInputs = z.infer<typeof updateFoodSchema>;

// ============================================
// Appointment Schemas
// ============================================

export const createAppointmentSchema = z
    .object({
        clientId: z.string().min(1, 'Client is required').uuid(),
        title: z.string().min(1, 'Title is required').max(200),
        description: z.string().max(1000).optional(),
        startTime: z.string().datetime('Invalid date format'),
        endTime: z.string().datetime('Invalid date format'),
        notes: z.string().max(500).optional(),
    })
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
        message: 'End time must be after start time',
        path: ['endTime'],
    });

export type CreateAppointmentFormInputs = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z
    .object({
        title: z.string().min(1, 'Title is required').max(200).optional(),
        description: z.string().max(1000).optional(),
        startTime: z.string().datetime('Invalid date format').optional(),
        endTime: z.string().datetime('Invalid date format').optional(),
        status: z.enum([AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]).optional(),
        notes: z.string().max(500).optional(),
    })
    .refine((data) => !data.startTime || !data.endTime || new Date(data.endTime) > new Date(data.startTime), {
        message: 'End time must be after start time',
        path: ['endTime'],
    });

export type UpdateAppointmentFormInputs = z.infer<typeof updateAppointmentSchema>;

// ============================================
// Pagination Schemas
// ============================================

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
