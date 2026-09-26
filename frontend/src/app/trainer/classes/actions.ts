'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { TrainerClass, LiveClassCategory } from '@/lib/types/classes';

export interface CreateTrainerClassData {
  title: string;
  description: string | null;
  category: LiveClassCategory;
  startTime: string;
  endTime: string;
  capacity: number;
  meetingUrl: string | null;
}

export interface UpdateTrainerClassData {
  title?: string;
  description?: string | null;
  category?: LiveClassCategory;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  meetingUrl?: string | null;
}

export async function createTrainerClassAction(data: CreateTrainerClassData) {
  try {
    const response = await fetchApi<{ class: TrainerClass }>('/api/trainer/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/trainer/classes');
    revalidatePath('/trainer/dashboard');
    return { success: true, class: response.class };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while creating the class.' };
  }
}

export async function updateTrainerClassAction(id: string, data: UpdateTrainerClassData) {
  try {
    const response = await fetchApi<{ class: TrainerClass }>(`/api/trainer/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/trainer/classes');
    revalidatePath(`/trainer/classes/${id}`);
    revalidatePath('/trainer/dashboard');
    return { success: true, class: response.class };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while updating the class.' };
  }
}

export async function getTrainerClassAction(id: string) {
  try {
    const response = await fetchApi<{ class: TrainerClass }>(`/api/trainer/classes/${id}`, {
      method: 'GET',
    });
    return { success: true, class: response.class };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while fetching the class.' };
  }
}

export async function getTrainerSpecializationAction() {
  try {
    const response = await fetchApi<{ specialization: LiveClassCategory }>('/api/trainer/classes/specialization');
    return { success: true, specialization: response.specialization };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to retrieve trainer specialization.' };
  }
}
