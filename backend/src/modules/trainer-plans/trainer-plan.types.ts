import { z } from 'zod';
import { trainerPlanValidation } from './trainer-plan.validation';

export type CreateTrainerPlanRequestDto = z.infer<typeof trainerPlanValidation.createTrainerPlanSchema>;
export type UpdateTrainerPlanRequestDto = z.infer<typeof trainerPlanValidation.updateTrainerPlanSchema>;
export type UpdateTrainerPlanStatusRequestDto = z.infer<typeof trainerPlanValidation.updateTrainerPlanStatusSchema>;

export interface TrainerPlanResponseDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
  trainerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
