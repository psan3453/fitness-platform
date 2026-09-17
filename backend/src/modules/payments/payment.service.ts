import { prisma } from '../../prisma';
import { getRazorpayClient, getRazorpayConfig } from '../../config/razorpay';
import { CreateOrderRequestDto, CreateOrderResponseDto } from './payment.types';

export const paymentService = {
  createOrder: async (userId: string, data: CreateOrderRequestDto): Promise<CreateOrderResponseDto> => {
    // 1. Validate planId & fetch SubscriptionPlan directly from database
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      const error = new Error('Subscription plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    if (!plan.isActive) {
      const error = new Error('Subscription plan is currently inactive.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    const planPrice = Number(plan.price);
    if (isNaN(planPrice) || planPrice <= 0) {
      const error = new Error('Invalid subscription plan price.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    if (!plan.durationDays || plan.durationDays <= 0) {
      const error = new Error('Invalid subscription plan duration.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    // 2. Safe deterministic amount in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(planPrice * 100);

    // 3. Obtain Razorpay client & keyId (fails cleanly if credentials are not configured)
    const razorpay = getRazorpayClient();
    const { keyId } = getRazorpayConfig();

    // 4. Create Razorpay order
    const receipt = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    let razorpayOrder;

    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          planId: plan.id,
          userId,
        },
      });
    } catch (err: unknown) {
      console.error('[paymentService.createOrder] Razorpay order creation failed:', err instanceof Error ? err.message : 'Unknown error');
      const error = new Error('Failed to create payment order with provider.') as Error & { status: number };
      error.status = 502;
      throw error;
    }

    // 5. Persist internal PENDING Subscription and PENDING Payment atomically
    const now = new Date();
    const startDate = now;
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    try {
      const { subscription } = await prisma.$transaction(async (tx) => {
        const newSubscription = await tx.subscription.create({
          data: {
            userId,
            planId: plan.id,
            status: 'PENDING',
            startDate,
            endDate,
          },
        });

        await tx.payment.create({
          data: {
            userId,
            subscriptionId: newSubscription.id,
            provider: 'razorpay',
            providerOrderId: razorpayOrder.id,
            providerPaymentId: null,
            amount: plan.price,
            currency: 'INR',
            status: 'PENDING',
            paidAt: null,
          },
        });

        return { subscription: newSubscription };
      });

      // 6. Return only safe data required for frontend checkout
      return {
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId,
        subscriptionId: subscription.id,
      };
    } catch (dbError: unknown) {
      console.error('[paymentService.createOrder] Database persistence failed for order:', razorpayOrder.id);
      const error = new Error('Failed to record pending payment order.') as Error & { status: number };
      error.status = 500;
      throw error;
    }
  },
};
