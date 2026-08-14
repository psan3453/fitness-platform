import { z } from 'zod';

export const authValidation = {
  tokenSchema: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required').trim(),
  }),
  loginSchema: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
  registerSchema: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.string().trim().optional(),
    bio: z.string().trim().optional(),
    // The role field is explicitly NOT included here so it gets stripped out or ignored
  }),
};
