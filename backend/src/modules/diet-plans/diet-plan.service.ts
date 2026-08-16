import { prisma } from '../../prisma';
import { DietGoal, UserRole } from '../../generated/prisma/enums';
import { DietPlanResponseDto, DietPlanItemResponseDto } from './diet-plan.types';

const mapItems = (items: any[]): DietPlanItemResponseDto[] =>
  items.map(item => ({
    id: item.id,
    mealType: item.mealType,
    mealName: item.mealName,
    description: item.description,
    quantity: item.quantity,
    displayOrder: item.displayOrder,
  }));

const mapPlan = (plan: any): DietPlanResponseDto => ({
  id: plan.id,
  creatorId: plan.creatorId,
  title: plan.title,
  goal: plan.goal as DietGoal,
  description: plan.description,
  isActive: plan.isActive,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
  items: mapItems(plan.dietPlanItems || []),
});

export const dietPlanService = {
  create: async (
    creatorId: string,
    data: {
      title: string;
      goal: DietGoal;
      description?: string | null;
      items: {
        mealType: string;
        mealName: string;
        description?: string | null;
        quantity?: string | null;
        displayOrder: number;
      }[];
    }
  ): Promise<DietPlanResponseDto> => {
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.dietPlan.create({
        data: {
          creatorId,
          title: data.title,
          goal: data.goal,
          description: data.description ?? null,
          dietPlanItems: {
            create: data.items.map(item => ({
              mealType: item.mealType,
              mealName: item.mealName,
              description: item.description ?? null,
              quantity: item.quantity ?? null,
              displayOrder: item.displayOrder,
            })),
          },
        },
        include: {
          dietPlanItems: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
      return plan;
    });

    return mapPlan(result);
  },

  getActivePlans: async (): Promise<DietPlanResponseDto[]> => {
    const plans = await prisma.dietPlan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        dietPlanItems: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return plans.map(mapPlan);
  },

  getActivePlanById: async (id: string): Promise<DietPlanResponseDto | null> => {
    const plan = await prisma.dietPlan.findUnique({
      where: { id },
      include: {
        dietPlanItems: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!plan || !plan.isActive) {
      return null;
    }

    return mapPlan(plan);
  },

  getMyPlans: async (userId: string, role: string): Promise<DietPlanResponseDto[]> => {
    const where = role === UserRole.ADMIN ? {} : { creatorId: userId };

    const plans = await prisma.dietPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        dietPlanItems: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return plans.map(mapPlan);
  },

  update: async (
    planId: string,
    userId: string,
    role: string,
    data: {
      title?: string;
      goal?: DietGoal;
      description?: string | null;
      isActive?: boolean;
      items?: {
        mealType: string;
        mealName: string;
        description?: string | null;
        quantity?: string | null;
        displayOrder: number;
      }[];
    }
  ): Promise<DietPlanResponseDto> => {
    // 1. Find the plan
    const existing = await prisma.dietPlan.findUnique({
      where: { id: planId },
    });

    if (!existing) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    // 2. Ownership check for TRAINER
    if (role === UserRole.TRAINER && existing.creatorId !== userId) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    // 3. Build the plan update data (excluding items)
    const planUpdateData: Record<string, unknown> = {};
    if (data.title !== undefined) planUpdateData.title = data.title;
    if (data.goal !== undefined) planUpdateData.goal = data.goal;
    if (data.description !== undefined) planUpdateData.description = data.description;
    if (data.isActive !== undefined) planUpdateData.isActive = data.isActive;

    // 4. Transaction: update plan, optionally replace items
    const result = await prisma.$transaction(async (tx) => {
      // Update plan fields
      await tx.dietPlan.update({
        where: { id: planId },
        data: planUpdateData,
      });

      // If items are provided, delete all existing and recreate
      if (data.items) {
        await tx.dietPlanItem.deleteMany({
          where: { dietPlanId: planId },
        });

        await tx.dietPlanItem.createMany({
          data: data.items.map(item => ({
            dietPlanId: planId,
            mealType: item.mealType,
            mealName: item.mealName,
            description: item.description ?? null,
            quantity: item.quantity ?? null,
            displayOrder: item.displayOrder,
          })),
        });
      }

      // Re-fetch updated plan with items
      return tx.dietPlan.findUniqueOrThrow({
        where: { id: planId },
        include: {
          dietPlanItems: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    return mapPlan(result);
  },

  delete: async (planId: string, userId: string, role: string): Promise<void> => {
    const existing = await prisma.dietPlan.findUnique({
      where: { id: planId },
    });

    if (!existing) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    if (role === UserRole.TRAINER && existing.creatorId !== userId) {
      const error = new Error('Diet plan not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    // CASCADE will delete DietPlanItems
    await prisma.$transaction(async (tx) => {
      await tx.dietPlan.delete({
        where: { id: planId },
      });
    });
  },
};
