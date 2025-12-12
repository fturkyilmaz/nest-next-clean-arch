import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

export const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
});

export type RegistrationFormInputs = z.infer<typeof registrationSchema>;

export const createClientSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(), // Consider more robust date validation if needed
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']), // Assuming these are the only valid values
  allergies: z.string().optional(), // Will be split by comma later
  conditions: z.string().optional(), // Will be split by comma later
  medications: z.string().optional(), // Will be split by comma later
  notes: z.string().optional(),
});

export type CreateClientFormInputs = z.infer<typeof createClientSchema>;

export const createDietPlanSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  name: z.string().min(1, 'Plan Name is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start Date is required'), // Consider more robust date validation
  endDate: z.string().optional(), // Consider more robust date validation
  targetCalories: z.string().optional().refine((val) => !val || !isNaN(Number(val)), { message: "Must be a number" }),
  targetProtein: z.string().optional().refine((val) => !val || !isNaN(Number(val)), { message: "Must be a number" }),
  targetCarbs: z.string().optional().refine((val) => !val || !isNaN(Number(val)), { message: "Must be a number" }),
  targetFat: z.string().optional().refine((val) => !val || !isNaN(Number(val)), { message: "Must be a number" }),
  targetFiber: z.string().optional().refine((val) => !val || !isNaN(Number(val)), { message: "Must be a number" }),
});

export type CreateDietPlanFormInputs = z.infer<typeof createDietPlanSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
});

export type UpdateUserFormInputs = z.infer<typeof updateUserSchema>;

export const updateClientSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateClientFormInputs = z.infer<typeof updateClientSchema>;

export const addClientMetricsSchema = z.object({
  weight: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Weight must be a positive number" }),
  height: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Height must be a positive number" }),
  bodyFat: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), { message: "Body Fat must be a positive number" }),
  waist: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), { message: "Waist must be a positive number" }),
  hip: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), { message: "Hip must be a positive number" }),
  notes: z.string().optional(),
});

export type AddClientMetricsFormInputs = z.infer<typeof addClientMetricsSchema>;

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['ADMIN', 'DIETITIAN', 'CLIENT']), // Assuming these are the valid roles
});

export type CreateUserFormInputs = z.infer<typeof createUserSchema>;
