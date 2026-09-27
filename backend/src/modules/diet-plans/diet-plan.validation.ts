import { z } from 'zod';
import { DietGoal } from '../../generated/prisma/enums';

const dietPlanItemSchema = z.object({
  mealType: z.string().trim().min(1, 'Meal type is required'),
  mealName: z.string().trim().min(1, 'Meal name is required'),
  description: z.string().trim().nullable().optional(),
  quantity: z.string().trim().nullable().optional(),
  displayOrder: z.number().int('Display order must be an integer').positive('Display order must be positive'),
}).strict();

export const dietPlanValidation = {
  createSchema: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    goal: z.nativeEnum(DietGoal, { message: 'Invalid diet goal' }),
    description: z.string().trim().nullable().optional(),
    trainerId: z.string().trim().optional(),
    items: z.array(dietPlanItemSchema).min(1, 'At least one item is required'),
  }).strict().refine((data) => {
    const orders = data.items.map(i => i.displayOrder);
    return new Set(orders).size === orders.length;
  }, {
    message: 'Duplicate displayOrder values are not allowed',
    path: ['items'],
  }),

  updateSchema: z.object({
    title: z.string().trim().min(1, 'Title is required').optional(),
    goal: z.nativeEnum(DietGoal, { message: 'Invalid diet goal' }).optional(),
    description: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
    items: z.array(dietPlanItemSchema).min(1, 'At least one item is required').optional(),
  }).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'Update body cannot be empty',
  }).refine((data) => {
    if (!data.items) return true;
    const orders = data.items.map(i => i.displayOrder);
    return new Set(orders).size === orders.length;
  }, {
    message: 'Duplicate displayOrder values are not allowed',
    path: ['items'],
  }),
};
