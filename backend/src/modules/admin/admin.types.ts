import { z } from 'zod';
import { adminValidation } from './admin.validation';
import { TrainerApplicationStatus } from '../../generated/prisma/enums';

export type RejectApplicationRequestDto = z.infer<typeof adminValidation.rejectApplicationSchema>;

export interface AdminTrainerApplicationResponseDto {
  id: string;
  userId: string;
  bio: string | null;
  specialization: string;
  experience: string | null;
  certifications: string | null;
  status: TrainerApplicationStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string | null;
    } | null;
  };
}
