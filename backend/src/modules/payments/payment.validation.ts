import { z } from 'zod';

export const paymentValidation = {
  createOrderSchema: z.object({
    planId: z.string().uuid('Invalid plan ID format').min(1, 'Plan ID is required'),
  }).strict(),

  verifyPaymentSchema: z.object({
    razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
    razorpay_order_id: z.string().min(1, 'Order ID is required'),
    razorpay_signature: z.string().min(1, 'Signature is required'),
  }).strict(),
};
