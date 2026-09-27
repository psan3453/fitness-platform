import { DietGoal, LiveClassCategory } from '../../generated/prisma/enums';

export interface DietPlanItemResponseDto {
  id: string;
  mealType: string;
  mealName: string;
  description: string | null;
  quantity: string | null;
  displayOrder: number;
}

export interface TrainerInfoDto {
  id: string;
  name: string;
  specialization: LiveClassCategory;
  profileImageUrl: string | null;
}

export interface DietPlanResponseDto {
  id: string;
  creatorId: string;
  trainerId: string | null;
  trainer?: TrainerInfoDto | null;
  title: string;
  goal: DietGoal;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: DietPlanItemResponseDto[];
}

export interface CreateDietPlanItemInput {
  mealType: string;
  mealName: string;
  description?: string | null;
  quantity?: string | null;
  displayOrder: number;
}

export interface CreateDietPlanInput {
  title: string;
  goal: DietGoal;
  description?: string | null;
  trainerId?: string;
  items: CreateDietPlanItemInput[];
}

export interface UpdateDietPlanInput {
  title?: string;
  goal?: DietGoal;
  description?: string | null;
  isActive?: boolean;
  items?: CreateDietPlanItemInput[];
}
