import { z } from 'zod';
import { paymentValidation } from './payment.validation';

export type CreateOrderRequestDto = z.infer<typeof paymentValidation.createOrderSchema>;

export interface CreateOrderResponseDto {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  subscriptionId: string;
}

export type VerifyPaymentRequestDto = z.infer<typeof paymentValidation.verifyPaymentSchema>;

export interface VerifyPaymentResponseDto {
  success: boolean;
  subscriptionId: string;
  status: 'ACTIVE';
  alreadyProcessed?: boolean;
}
