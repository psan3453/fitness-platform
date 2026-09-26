'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';

export async function joinClassAction(classId: string) {
  try {
    const data = await fetchApi<{ meetingUrl: string }>(`/api/classes/${classId}/join`, {
      method: 'POST',
    });
    revalidatePath('/classes');
    revalidatePath('/dashboard');
    return { success: true, meetingUrl: data.meetingUrl };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while joining the class.' };
  }
}
