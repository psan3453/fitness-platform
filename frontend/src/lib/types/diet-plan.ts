export type DietGoal = 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MUSCLE_GAIN' | 'GENERAL_FITNESS';

export interface DietPlanItem {
  id: string;
  mealType: string;
  mealName: string;
  description: string | null;
  quantity: string | null;
  displayOrder: number;
}

export interface TrainerInfo {
  id: string;
  name: string;
  specialization: string;
  profileImageUrl: string | null;
}

export interface DietPlan {
  id: string;
  creatorId: string;
  trainerId?: string | null;
  trainer?: TrainerInfo | null;
  title: string;
  goal: DietGoal;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: DietPlanItem[];
}

export interface DietPlansResponse {
  dietPlans: DietPlan[];
}

export interface SingleDietPlanResponse {
  dietPlan: DietPlan;
}
