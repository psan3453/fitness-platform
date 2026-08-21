'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { ProfileResponse, UpdateProfileData } from '@/lib/types/profile';

export async function updateProfileAction(data: UpdateProfileData) {
  try {
    const response = await fetchApi<ProfileResponse>('/api/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, profile: response.profile };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400 && Array.isArray(error.data)) {
        return { success: false, error: 'Please check your inputs and try again.' };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
