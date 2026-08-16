import { z } from 'zod';

export const userValidation = {
  updateProfileSchema: z.object({
    firstName: z.string().min(1, 'First name cannot be empty').trim().optional(),
    lastName: z.string().trim().nullable().optional(),
    phone: z.string().trim().nullable().optional(),
    avatarUrl: z.string().url('Invalid URL').trim().nullable().optional(),
    dateOfBirth: z.coerce.date().nullable().optional(),
    gender: z.string().trim().nullable().optional(),
    bio: z.string().trim().nullable().optional(),
  }).strict(), // Reject unknown fields
};
