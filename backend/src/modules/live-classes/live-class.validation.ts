import { z } from 'zod';
import { LiveClassCategory, LiveClassStatus } from '../../generated/prisma/enums';

export const liveClassValidation = {
  updateClassStatusSchema: z.object({
    status: z.nativeEnum(LiveClassStatus, { message: 'Invalid status' }),
  }).strict(),
  createClassSchema: z.object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
    description: z.string().trim().nullable().optional(),
    category: z.nativeEnum(LiveClassCategory, { message: 'Invalid category' }),
    startTime: z.string().datetime({ message: 'Invalid datetime format' }),
    endTime: z.string().datetime({ message: 'Invalid datetime format' }),
    capacity: z.number().int('Capacity must be an integer').positive('Capacity must be positive').max(1000, 'Capacity is too large'),
    meetingUrl: z.string().url('Invalid URL').nullable().optional(),
  }).strict().refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  }),

  updateClassSchema: z.object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long').optional(),
    description: z.string().trim().nullable().optional(),
    category: z.nativeEnum(LiveClassCategory, { message: 'Invalid category' }).optional(),
    startTime: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
    endTime: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
    capacity: z.number().int('Capacity must be an integer').positive('Capacity must be positive').max(1000, 'Capacity is too large').optional(),
    meetingUrl: z.string().url('Invalid URL').nullable().optional(),
  }).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'Update body cannot be empty',
  }),
};
