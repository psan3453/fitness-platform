import { prisma } from '../../prisma';
import { DietGoal, SubscriptionStatus } from '../../generated/prisma/enums';
import {
  DietPlanResponseDto,
  DietPlanItemResponseDto,
  TrainerInfoDto,
  CreateDietPlanInput,
  UpdateDietPlanInput,
} from './diet-plan.types';

const mapItems = (items: any[]): DietPlanItemResponseDto[] =>
  items.map((item) => ({
    id: item.id,
    mealType: item.mealType,
    mealName: item.mealName,
    description: item.description,
    quantity: item.quantity,
    displayOrder: item.displayOrder,
  }));

const mapPlan = (plan: any): DietPlanResponseDto => {
  let trainerDto: TrainerInfoDto | null = null;
  if (plan.trainer) {
    const profile = plan.trainer.user?.profile;
    const trainerName = profile
      ? `${profile.firstName} ${profile.lastName || ''}`.trim()
      : plan.trainer.user?.email?.split('@')[0] || 'Trainer';

    trainerDto = {
      id: plan.trainer.id,
      name: trainerName,
      specialization: plan.trainer.specialization,
      profileImageUrl: plan.trainer.profileImageUrl || profile?.avatarUrl || null,
    };
  }

  return {
    id: plan.id,
    creatorId: plan.creatorId,
    trainerId: plan.trainerId || null,
    trainer: trainerDto,
    title: plan.title,
    goal: plan.goal as DietGoal,
    description: plan.description,
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    items: mapItems(plan.dietPlanItems || []),
  };
};

const dietPlanInclude = {
  dietPlanItems: {
    orderBy: { displayOrder: 'asc' as const },
  },
  trainer: {
    select: {
      id: true,
      specialization: true,
      profileImageUrl: true,
      isActive: true,
      user: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  },
};

// Helper to resolve active Trainer record from authenticated JWT userId
async function resolveTrainer(userId: string) {
  const trainer = await prisma.trainer.findUnique({ where: { userId } });

  if (!trainer) {
    const error = new Error('Trainer profile not found.') as Error & { status: number };
    error.status = 403;
    throw error;
  }

  if (!trainer.isActive) {
    const error = new Error('Trainer account is inactive.') as Error & { status: number };
    error.status = 403;
    throw error;
  }

  return trainer;
}

export const dietPlanService = {
  // ============================================================
  // TRAINER METHODS
  // ============================================================

  createTrainerPlan: async (
    userId: string,
    data: CreateDietPlanInput
  ): Promise<DietPlanResponseDto> => {
    const trainer = await resolveTrainer(userId);

    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.dietPlan.create({
        data: {
          creatorId: userId,
          trainerId: trainer.id, // Strictly derived server-side
          title: data.title,
          goal: data.goal,
          description: data.description ?? null,
          dietPlanItems: {
            create: data.items.map((item) => ({
              mealType: item.mealType,
              mealName: item.mealName,
              description: item.description ?? null,
              quantity: item.quantity ?? null,
              displayOrder: item.displayOrder,
            })),
          },
        },
        include: dietPlanInclude,
      });
      return plan;
    });

    return mapPlan(result);
  },

  getTrainerPlans: async (userId: string): Promise<DietPlanResponseDto[]> => {
    const trainer = await resolveTrainer(userId);

    const plans = await prisma.dietPlan.findMany({
      where: {
        trainerId: trainer.id,
      },
      orderBy: { createdAt: 'desc' },
      include: dietPlanInclude,
    });

    return plans.map(mapPlan);
  },

  getTrainerPlanById: async (userId: string, planId: string): Promise<DietPlanResponseDto> => {
    const trainer = await resolveTrainer(userId);

    const plan = await prisma.dietPlan.findFirst({
      where: {
        id: planId,
        trainerId: trainer.id,
      },
      include: dietPlanInclude,
    });

    if (!plan) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    return mapPlan(plan);
  },

  updateTrainerPlan: async (
    userId: string,
    planId: string,
    data: UpdateDietPlanInput
  ): Promise<DietPlanResponseDto> => {
    const trainer = await resolveTrainer(userId);

    const existing = await prisma.dietPlan.findFirst({
      where: {
        id: planId,
        trainerId: trainer.id,
      },
    });

    if (!existing) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    const planUpdateData: Record<string, unknown> = {};
    if (data.title !== undefined) planUpdateData.title = data.title;
    if (data.goal !== undefined) planUpdateData.goal = data.goal;
    if (data.description !== undefined) planUpdateData.description = data.description;
    if (data.isActive !== undefined) planUpdateData.isActive = data.isActive;

    const result = await prisma.$transaction(async (tx) => {
      await tx.dietPlan.update({
        where: { id: planId },
        data: planUpdateData,
      });

      if (data.items) {
        await tx.dietPlanItem.deleteMany({
          where: { dietPlanId: planId },
        });

        await tx.dietPlanItem.createMany({
          data: data.items.map((item) => ({
            dietPlanId: planId,
            mealType: item.mealType,
            mealName: item.mealName,
            description: item.description ?? null,
            quantity: item.quantity ?? null,
            displayOrder: item.displayOrder,
          })),
        });
      }

      return tx.dietPlan.findUniqueOrThrow({
        where: { id: planId },
        include: dietPlanInclude,
      });
    });

    return mapPlan(result);
  },

  deleteTrainerPlan: async (userId: string, planId: string): Promise<void> => {
    const trainer = await resolveTrainer(userId);

    const existing = await prisma.dietPlan.findFirst({
      where: {
        id: planId,
        trainerId: trainer.id,
      },
    });

    if (!existing) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    await prisma.dietPlan.delete({
      where: { id: planId },
    });
  },

  // ============================================================
  // SUBSCRIBER / USER METHODS
  // ============================================================

  getSubscriberPlans: async (userId: string): Promise<DietPlanResponseDto[]> => {
    const now = new Date();

    // Find all distinct active trainerIds from user's active, non-expired subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: now },
        plan: {
          trainerId: { not: null },
        },
      },
      select: {
        plan: {
          select: {
            trainerId: true,
          },
        },
      },
    });

    const trainerIds = Array.from(
      new Set(
        activeSubscriptions
          .map((s) => s.plan.trainerId)
          .filter((id): id is string => id !== null)
      )
    );

    if (trainerIds.length === 0) {
      return [];
    }

    const plans = await prisma.dietPlan.findMany({
      where: {
        isActive: true,
        trainerId: { in: trainerIds },
        trainer: {
          isActive: true,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: dietPlanInclude,
    });

    return plans.map(mapPlan);
  },

  getSubscriberPlanById: async (
    userId: string,
    planId: string
  ): Promise<DietPlanResponseDto> => {
    const plan = await prisma.dietPlan.findUnique({
      where: { id: planId },
      include: dietPlanInclude,
    });

    // Plan must exist, be active, have a non-null trainerId, and trainer must be active
    if (!plan || !plan.isActive || !plan.trainerId || !plan.trainer || !plan.trainer.isActive) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    // Verify user has an active, non-expired subscription to this plan's trainer
    const now = new Date();
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: now },
        plan: {
          trainerId: plan.trainerId,
        },
      },
    });

    if (!activeSubscription) {
      const error = new Error(
        'An active subscription with this trainer is required to view this diet plan.'
      ) as Error & { status: number };
      error.status = 403;
      throw error;
    }

    return mapPlan(plan);
  },

  // ============================================================
  // ADMIN PLATFORM METHODS
  // ============================================================

  adminCreatePlan: async (
    adminUserId: string,
    data: CreateDietPlanInput
  ): Promise<DietPlanResponseDto> => {
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.dietPlan.create({
        data: {
          creatorId: adminUserId,
          trainerId: null, // Admin-created plans are platform plans
          title: data.title,
          goal: data.goal,
          description: data.description ?? null,
          dietPlanItems: {
            create: data.items.map((item) => ({
              mealType: item.mealType,
              mealName: item.mealName,
              description: item.description ?? null,
              quantity: item.quantity ?? null,
              displayOrder: item.displayOrder,
            })),
          },
        },
        include: dietPlanInclude,
      });
      return plan;
    });

    return mapPlan(result);
  },

  adminGetAllPlans: async (): Promise<DietPlanResponseDto[]> => {
    const plans = await prisma.dietPlan.findMany({
      orderBy: { createdAt: 'desc' },
      include: dietPlanInclude,
    });

    return plans.map(mapPlan);
  },

  adminUpdatePlan: async (
    planId: string,
    data: UpdateDietPlanInput
  ): Promise<DietPlanResponseDto> => {
    const existing = await prisma.dietPlan.findUnique({
      where: { id: planId },
    });

    if (!existing) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    const planUpdateData: Record<string, unknown> = {};
    if (data.title !== undefined) planUpdateData.title = data.title;
    if (data.goal !== undefined) planUpdateData.goal = data.goal;
    if (data.description !== undefined) planUpdateData.description = data.description;
    if (data.isActive !== undefined) planUpdateData.isActive = data.isActive;

    const result = await prisma.$transaction(async (tx) => {
      await tx.dietPlan.update({
        where: { id: planId },
        data: planUpdateData,
      });

      if (data.items) {
        await tx.dietPlanItem.deleteMany({
          where: { dietPlanId: planId },
        });

        await tx.dietPlanItem.createMany({
          data: data.items.map((item) => ({
            dietPlanId: planId,
            mealType: item.mealType,
            mealName: item.mealName,
            description: item.description ?? null,
            quantity: item.quantity ?? null,
            displayOrder: item.displayOrder,
          })),
        });
      }

      return tx.dietPlan.findUniqueOrThrow({
        where: { id: planId },
        include: dietPlanInclude,
      });
    });

    return mapPlan(result);
  },

  adminDeletePlan: async (planId: string): Promise<void> => {
    const existing = await prisma.dietPlan.findUnique({
      where: { id: planId },
    });

    if (!existing) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    await prisma.dietPlan.delete({
      where: { id: planId },
    });
  },
};
