'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';

export async function cancelClassAction(classId: string) {
  try {
    await fetchApi(`/api/admin/classes/${classId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while updating the class.' };
  }
}
