import { z } from 'zod';
import { trainerApplicationValidation } from './trainer-application.validation';
import { TrainerApplicationStatus } from '../../generated/prisma/enums';

export type CreateApplicationRequestDto = z.infer<typeof trainerApplicationValidation.createApplicationSchema>;

export interface ApplicationResponseDto {
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
}
