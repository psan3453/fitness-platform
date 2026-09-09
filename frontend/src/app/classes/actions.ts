'use server';
import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { ClassBookingResponse } from '@/lib/types/classes';

export async function bookClassAction(classId: string) {
  try {
    const data = await fetchApi<ClassBookingResponse>(`/api/classes/${classId}/book`, {
      method: 'POST',
    });
    revalidatePath('/classes');
    revalidatePath('/dashboard');
    return { success: true, booking: data.booking };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while booking.' };
  }
}

export async function joinClassAction(bookingId: string) {
  try {
    const data = await fetchApi<{ meetingUrl: string }>(`/api/bookings/${bookingId}/join`);
    return { success: true, meetingUrl: data.meetingUrl };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred while joining.' };
  }
}
