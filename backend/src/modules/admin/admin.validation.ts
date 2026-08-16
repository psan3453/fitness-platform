import { z } from 'zod';

export const adminValidation = {
  rejectApplicationSchema: z.object({
    rejectionReason: z.string().trim().min(1, 'Rejection reason is required'),
  }).strict(),
};
