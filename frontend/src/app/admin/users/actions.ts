'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';

export async function toggleUserActiveAction(id: string, isActive: boolean) {
  try {
    await fetchApi(`/api/admin/users/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while updating the user.' };
  }
}
