'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';

export async function createSubscriptionPlanAction(data: {
  name: string;
  description: string;
  price: number;
  durationDays: number;
}) {
  try {
    await fetchApi('/api/admin/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/admin/subscriptions');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateSubscriptionPlanAction(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    price?: number;
    durationDays?: number;
    isActive?: boolean;
  }
) {
  try {
    await fetchApi(`/api/admin/subscription-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/admin/subscriptions');
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
