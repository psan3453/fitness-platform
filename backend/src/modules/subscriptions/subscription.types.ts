import { z } from 'zod';
import { subscriptionValidation } from './subscription.validation';
import { SubscriptionStatus } from '../../generated/prisma/enums';

export type CreatePlanRequestDto = z.infer<typeof subscriptionValidation.createPlanSchema>;
export type UpdatePlanRequestDto = z.infer<typeof subscriptionValidation.updatePlanSchema>;

export interface SubscriptionPlanResponseDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscriptionResponseDto {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  plan: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  };
}
