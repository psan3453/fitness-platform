import crypto from 'crypto';
import { prisma } from '../../prisma';
import { getRazorpayClient, getRazorpayConfig } from '../../config/razorpay';
import { CreateOrderRequestDto, CreateOrderResponseDto, VerifyPaymentRequestDto, VerifyPaymentResponseDto } from './payment.types';

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

    if (plan.price.lessThanOrEqualTo(0)) {
      const error = new Error('Invalid subscription plan price.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    if (!plan.durationDays || plan.durationDays <= 0) {
      const error = new Error('Invalid subscription plan duration.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    // 2. Safe deterministic amount in smallest currency unit (paise for INR) using Decimal arithmetic
    const amountInPaise = plan.price.mul(100).toNumber();

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

    // 5. Persist internal PENDING Subscription and PENDING Payment atomically with calendar-day arithmetic
    const now = new Date();
    const startDate = now;
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.durationDays);

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

  verifyPayment: async (userId: string, data: VerifyPaymentRequestDto): Promise<VerifyPaymentResponseDto> => {
    // 1. Find internal Payment record by providerOrderId, including subscription and plan
    const payment = await prisma.payment.findUnique({
      where: { providerOrderId: data.razorpay_order_id },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    // 2. Ownership & existence check: do not leak cross-user orders
    if (!payment || payment.userId !== userId || payment.subscription.userId !== userId) {
      const error = new Error('Payment order not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    if (!payment.providerOrderId) {
      const error = new Error('Payment order record is invalid.') as Error & { status: 400 };
      error.status = 400;
      throw error;
    }

    if (payment.provider !== 'razorpay' || payment.currency !== 'INR') {
      const error = new Error('Invalid payment provider or currency.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    if (!payment.subscription.plan || payment.subscription.plan.durationDays <= 0) {
      const error = new Error('Associated subscription plan is invalid.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    // 3. Verify Razorpay HMAC-SHA256 signature using SERVER-STORED providerOrderId
    const { keySecret } = getRazorpayConfig();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${payment.providerOrderId}|${data.razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(data.razorpay_signature, 'utf-8');

    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      const error = new Error('Invalid payment signature.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    // 4. Idempotency handling: verify both Payment SUCCESS and Subscription ACTIVE
    if (payment.status === 'SUCCESS') {
      if (payment.providerPaymentId === data.razorpay_payment_id) {
        if (payment.subscription.status !== 'ACTIVE') {
          const error = new Error('Payment was completed but associated subscription is not in an active state.') as Error & { status: number };
          error.status = 500;
          throw error;
        }
        return {
          success: true,
          subscriptionId: payment.subscriptionId,
          status: 'ACTIVE',
          alreadyProcessed: true,
        };
      }
      const error = new Error('Payment order has already been processed with a different payment ID.') as Error & { status: number };
      error.status = 409;
      throw error;
    }

    if (payment.status !== 'PENDING') {
      const error = new Error('Payment order is not in a payable state.') as Error & { status: number };
      error.status = 409;
      throw error;
    }

    // 5. Verify payment / order consistency with Razorpay provider API
    const razorpay = getRazorpayClient();
    let razorpayPayment;

    try {
      razorpayPayment = await razorpay.payments.fetch(data.razorpay_payment_id);
    } catch (err: unknown) {
      console.error('[paymentService.verifyPayment] Razorpay fetch failed:', err instanceof Error ? err.message : 'Unknown error');
      const error = new Error('Failed to verify payment with provider.') as Error & { status: number };
      error.status = 502;
      throw error;
    }

    if (razorpayPayment.order_id !== payment.providerOrderId) {
      const error = new Error('Payment order association mismatch.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    // Decimal-based money calculation without unsafe float conversion
    const expectedPaise = payment.amount.mul(100).toNumber();
    if (Number(razorpayPayment.amount) !== expectedPaise) {
      const error = new Error('Payment amount mismatch.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    if (razorpayPayment.currency !== payment.currency) {
      const error = new Error('Payment currency mismatch.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    if (razorpayPayment.status !== 'captured' && !razorpayPayment.captured) {
      const error = new Error('Payment has not been captured.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    // 6. Atomic conditional activation inside Prisma transaction
    const now = new Date();
    const durationDays = payment.subscription.plan.durationDays;
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + durationDays);

    let isAlreadyProcessed = false;

    try {
      await prisma.$transaction(async (tx) => {
        // Atomic conditional update: only update if status is still PENDING
        const updateResult = await tx.payment.updateMany({
          where: {
            id: payment.id,
            status: 'PENDING',
          },
          data: {
            status: 'SUCCESS',
            providerPaymentId: data.razorpay_payment_id,
            paidAt: now,
          },
        });

        if (updateResult.count === 1) {
          // Single-winner transitions subscription to ACTIVE
          await tx.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
              status: 'ACTIVE',
              startDate: now,
              endDate,
            },
          });
          return;
        }

        // If 0 rows were updated, re-read state to handle concurrent requests
        const reloadedPayment = await tx.payment.findUnique({
          where: { id: payment.id },
          include: {
            subscription: true,
          },
        });

        if (reloadedPayment?.status === 'SUCCESS') {
          if (reloadedPayment.providerPaymentId === data.razorpay_payment_id) {
            if (reloadedPayment.subscription.status !== 'ACTIVE') {
              const error = new Error('Payment was completed but associated subscription is not in an active state.') as Error & { status: number };
              error.status = 500;
              throw error;
            }
            isAlreadyProcessed = true;
            return;
          }
          const conflictError = new Error('Payment order has already been processed with a different payment ID.') as Error & { status: number };
          conflictError.status = 409;
          throw conflictError;
        }

        const unexpectedError = new Error('Payment order is not in a valid state for activation.') as Error & { status: number };
        unexpectedError.status = 409;
        throw unexpectedError;
      });

      return {
        success: true,
        subscriptionId: payment.subscriptionId,
        status: 'ACTIVE',
        ...(isAlreadyProcessed ? { alreadyProcessed: true } : {}),
      };
    } catch (dbError: unknown) {
      const err = dbError as Error & { status?: number };
      if (err.status) {
        throw err;
      }
      console.error('[paymentService.verifyPayment] Atomic activation failed:', dbError instanceof Error ? dbError.message : 'Unknown error');
      const error = new Error('Failed to activate subscription.') as Error & { status: number };
      error.status = 500;
      throw error;
    }
  },
};
