'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { TrainerApplicationResponse } from '@/lib/types/trainer';

export interface SubmitApplicationData {
  bio?: string;
  specialization: string;
  experience?: string;
  certifications?: string;
}

export async function submitApplicationAction(data: SubmitApplicationData) {
  try {
    const response = await fetchApi<TrainerApplicationResponse>('/api/trainer-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    revalidatePath('/trainers');
    return { success: true, application: response.application };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400 && Array.isArray(error.data)) {
        // Handle Zod validation errors nicely if needed
        return { success: false, error: 'Please check your form inputs.' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
