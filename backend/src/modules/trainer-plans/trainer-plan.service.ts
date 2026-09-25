import { prisma } from '../../prisma';
import {
  CreateTrainerPlanRequestDto,
  UpdateTrainerPlanRequestDto,
  UpdateTrainerPlanStatusRequestDto,
  TrainerPlanResponseDto,
} from './trainer-plan.types';

// Helper to resolve Trainer record from JWT userId
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

export const trainerPlanService = {
  getPlans: async (userId: string): Promise<TrainerPlanResponseDto[]> => {
    const trainer = await resolveTrainer(userId);

    const plans = await prisma.subscriptionPlan.findMany({
      where: { trainerId: trainer.id },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      durationDays: plan.durationDays,
      isActive: plan.isActive,
      trainerId: plan.trainerId,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  },

  createPlan: async (userId: string, data: CreateTrainerPlanRequestDto): Promise<TrainerPlanResponseDto> => {
    const trainer = await resolveTrainer(userId);

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        durationDays: data.durationDays,
        isActive: true,
        trainerId: trainer.id,
      },
    });

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      durationDays: plan.durationDays,
      isActive: plan.isActive,
      trainerId: plan.trainerId,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  },

  updatePlan: async (
    userId: string,
    planId: string,
    data: UpdateTrainerPlanRequestDto
  ): Promise<TrainerPlanResponseDto> => {
    const trainer = await resolveTrainer(userId);

    const existing = await prisma.subscriptionPlan.findFirst({
      where: {
        id: planId,
        trainerId: trainer.id,
      },
    });

    if (!existing) {
      const error = new Error('Subscription plan not found') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    const updated = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name: data.name,
        description: data.description !== undefined ? data.description : undefined,
        price: data.price,
        durationDays: data.durationDays,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      price: Number(updated.price),
      durationDays: updated.durationDays,
      isActive: updated.isActive,
      trainerId: updated.trainerId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  },

  updatePlanStatus: async (
    userId: string,
    planId: string,
    data: UpdateTrainerPlanStatusRequestDto
  ): Promise<TrainerPlanResponseDto> => {
    const trainer = await resolveTrainer(userId);

    const existing = await prisma.subscriptionPlan.findFirst({
      where: {
        id: planId,
        trainerId: trainer.id,
      },
    });

    if (!existing) {
      const error = new Error('Subscription plan not found') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    const updated = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        isActive: data.isActive,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      price: Number(updated.price),
      durationDays: updated.durationDays,
      isActive: updated.isActive,
      trainerId: updated.trainerId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  },
};
