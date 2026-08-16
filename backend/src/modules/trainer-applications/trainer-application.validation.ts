import { z } from 'zod';

export const trainerApplicationValidation = {
  createApplicationSchema: z.object({
    bio: z.string().trim().nullable().optional(),
    specialization: z.string().min(1, 'Specialization is required').trim(),
    experience: z.string().trim().nullable().optional(),
    certifications: z.string().trim().nullable().optional(),
  }).strict(),
};
