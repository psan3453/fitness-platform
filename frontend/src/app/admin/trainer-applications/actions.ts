'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';

export async function approveTrainerApplicationAction(id: string) {
  try {
    await fetchApi(`/api/admin/trainer-applications/${id}/approve`, {
      method: 'PATCH',
    });
    revalidatePath('/admin/trainer-applications');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while approving the application.' };
  }
}

export async function rejectTrainerApplicationAction(id: string, rejectionReason: string) {
  try {
    await fetchApi(`/api/admin/trainer-applications/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason }),
    });
    revalidatePath('/admin/trainer-applications');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while rejecting the application.' };
  }
}
