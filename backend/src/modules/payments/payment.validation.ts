import { z } from 'zod';

export const paymentValidation = {
  createOrderSchema: z.object({
    planId: z.string().uuid('Invalid plan ID format').min(1, 'Plan ID is required'),
  }).strict(),
};
