import { z } from 'zod';

export const subscriptionValidation = {
  createPlanSchema: z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
    description: z.string().trim().nullable().optional(),
    price: z.number().positive('Price must be positive').finite(),
    durationDays: z.number().int('Duration must be an integer').positive('Duration must be positive'),
  }).strict(),

  updatePlanSchema: z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long').optional(),
    description: z.string().trim().nullable().optional(),
    price: z.number().positive('Price must be positive').finite().optional(),
    durationDays: z.number().int('Duration must be an integer').positive('Duration must be positive').optional(),
    isActive: z.boolean().optional(),
  }).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'Update body cannot be empty',
  }),
};
