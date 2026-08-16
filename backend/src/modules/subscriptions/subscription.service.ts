import { prisma } from '../../prisma';
import { CreatePlanRequestDto, UpdatePlanRequestDto, SubscriptionPlanResponseDto, UserSubscriptionResponseDto } from './subscription.types';

export const subscriptionService = {
  // Admin Plan Management
  createPlan: async (data: CreatePlanRequestDto): Promise<SubscriptionPlanResponseDto> => {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        durationDays: data.durationDays,
        isActive: true,
      },
    });

    return {
      ...plan,
      price: Number(plan.price),
    };
  },

  getAllPlans: async (): Promise<SubscriptionPlanResponseDto[]> => {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return plans.map(plan => ({
      ...plan,
      price: Number(plan.price),
    }));
  },

  updatePlan: async (id: string, data: UpdatePlanRequestDto): Promise<SubscriptionPlanResponseDto> => {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error('Subscription plan not found') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationDays: data.durationDays,
        isActive: data.isActive,
      },
    });

    return {
      ...plan,
      price: Number(plan.price),
    };
  },

  // User Plan Browsing
  getActivePlans: async (): Promise<SubscriptionPlanResponseDto[]> => {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return plans.map(plan => ({
      ...plan,
      price: Number(plan.price),
    }));
  },

  // User Subscription Visibility
  getUserSubscriptions: async (userId: string): Promise<UserSubscriptionResponseDto[]> => {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            durationDays: true,
          }
        }
      }
    });

    return subscriptions.map(sub => ({
      id: sub.id,
      planId: sub.planId,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        price: Number(sub.plan.price),
        durationDays: sub.plan.durationDays,
      }
    }));
  },
};
