'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { DietGoal } from '@/lib/types/diet-plan';

export async function createTrainerDietPlanAction(data: {
  title: string;
  goal: DietGoal;
  description?: string | null;
  items: {
    mealType: string;
    mealName: string;
    description?: string | null;
    quantity?: string | null;
    displayOrder: number;
  }[];
}) {
  try {
    await fetchApi('/api/trainer/diet-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/trainer/diet-plans');
    revalidatePath('/trainer/dashboard');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateTrainerDietPlanAction(
  id: string,
  data: {
    title?: string;
    goal?: DietGoal;
    description?: string | null;
    isActive?: boolean;
    items?: {
      mealType: string;
      mealName: string;
      description?: string | null;
      quantity?: string | null;
      displayOrder: number;
    }[];
  }
) {
  try {
    await fetchApi(`/api/trainer/diet-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/trainer/diet-plans');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteTrainerDietPlanAction(id: string) {
  try {
    await fetchApi(`/api/trainer/diet-plans/${id}`, {
      method: 'DELETE',
    });
    revalidatePath('/trainer/diet-plans');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
