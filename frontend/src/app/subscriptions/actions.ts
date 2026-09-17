'use server';

import { revalidatePath } from 'next/cache';
import { fetchApi, ApiError } from '@/lib/api/fetcher';

export interface CreateOrderResult {
  success: boolean;
  order?: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    subscriptionId: string;
  };
  error?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  subscriptionId?: string;
  status?: string;
  alreadyProcessed?: boolean;
  error?: string;
}

export async function createSubscriptionOrderAction(planId: string): Promise<CreateOrderResult> {
  try {
    const order = await fetchApi<{
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      subscriptionId: string;
    }>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });

    return { success: true, order };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create payment order. Please try again.' };
  }
}

export async function verifySubscriptionPaymentAction(paymentData: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}): Promise<VerifyPaymentResult> {
  try {
    const result = await fetchApi<{
      success: boolean;
      subscriptionId: string;
      status: 'ACTIVE';
      alreadyProcessed?: boolean;
    }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    revalidatePath('/subscriptions');
    revalidatePath('/dashboard');

    return {
      success: true,
      subscriptionId: result.subscriptionId,
      status: result.status,
      alreadyProcessed: result.alreadyProcessed,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to verify payment. Please contact support.' };
  }
}
