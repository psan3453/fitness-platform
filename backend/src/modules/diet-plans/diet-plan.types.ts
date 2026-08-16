import { DietGoal } from '../../generated/prisma/enums';

export interface DietPlanItemResponseDto {
  id: string;
  mealType: string;
  mealName: string;
  description: string | null;
  quantity: string | null;
  displayOrder: number;
}

export interface DietPlanResponseDto {
  id: string;
  creatorId: string;
  title: string;
  goal: DietGoal;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: DietPlanItemResponseDto[];
}
