import { prisma } from '../../prisma';
import {
  CreateLiveClassRequestDto,
  UpdateLiveClassRequestDto,
  LiveClassResponseDto,
  LiveClassWithTrainerDto,
  AdminLiveClassDto,
  JoinLiveClassResponseDto,
  TrainerSpecializationResponseDto,
} from './live-class.types';
import {
  LiveClassCategory,
  LiveClassStatus,
  BookingStatus,
  SubscriptionStatus,
} from '../../generated/prisma/enums';

// Helper to resolve Trainer.id from JWT userId
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

export const liveClassService = {
  createClass: async (userId: string, data: CreateLiveClassRequestDto): Promise<LiveClassResponseDto> => {
    const trainer = await resolveTrainer(userId);

    if (data.category !== trainer.specialization) {
      const error = new Error(`Trainer specialization is ${trainer.specialization}. You cannot create a ${data.category} class.`) as Error & { status: number };
      error.status = 400;
      throw error;
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        trainerId: trainer.id,
        title: data.title,
        description: data.description || null,
        category: data.category as LiveClassCategory,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        capacity: data.capacity,
        meetingUrl: data.meetingUrl || null,
        status: 'SCHEDULED',
      },
    });

    return liveClass;
  },

  getTrainerClasses: async (userId: string): Promise<LiveClassResponseDto[]> => {
    const trainer = await resolveTrainer(userId);

    const classes = await prisma.liveClass.findMany({
      where: { trainerId: trainer.id },
      orderBy: { startTime: 'asc' },
    });

    return classes;
  },

  getTrainerClassById: async (userId: string, classId: string): Promise<LiveClassResponseDto> => {
    const trainer = await resolveTrainer(userId);

    const liveClass = await prisma.liveClass.findFirst({
      where: { id: classId, trainerId: trainer.id },
    });

    if (!liveClass) {
      const error = new Error('Class not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    return liveClass;
  },

  updateClass: async (userId: string, classId: string, data: UpdateLiveClassRequestDto): Promise<LiveClassResponseDto> => {
    const trainer = await resolveTrainer(userId);

    // Find the class and verify ownership
    const existing = await prisma.liveClass.findFirst({
      where: { id: classId, trainerId: trainer.id },
    });

    if (!existing) {
      const error = new Error('Class not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    if (data.category && data.category !== trainer.specialization) {
      const error = new Error(`Trainer specialization is ${trainer.specialization}. You cannot update category to ${data.category}.`) as Error & { status: number };
      error.status = 400;
      throw error;
    }

    // Validate the resulting time range if either time is being updated
    const finalStartTime = data.startTime ? new Date(data.startTime) : existing.startTime;
    const finalEndTime = data.endTime ? new Date(data.endTime) : existing.endTime;

    if (finalEndTime <= finalStartTime) {
      const error = new Error('End time must be after start time.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    const updated = await prisma.liveClass.update({
      where: { id: classId },
      data: {
        title: data.title,
        description: data.description,
        category: data.category as LiveClassCategory | undefined,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        capacity: data.capacity,
        meetingUrl: data.meetingUrl,
      },
    });

    return updated;
  },

  // User: discover classes
  discoverClasses: async (category?: string): Promise<LiveClassWithTrainerDto[]> => {
    const where: Record<string, unknown> = { status: 'SCHEDULED' };
    if (category && Object.values(LiveClassCategory).includes(category as LiveClassCategory)) {
      where.category = category;
    }

    const classes = await prisma.liveClass.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        trainer: {
          select: {
            id: true,
            specialization: true,
            profileImageUrl: true,
          },
        },
      },
    });

    return classes.map(c => {
      const { meetingUrl, ...rest } = c;
      return rest;
    });
  },

  // User: get class details
  getClassDetails: async (classId: string): Promise<LiveClassWithTrainerDto | null> => {
    const liveClass = await prisma.liveClass.findFirst({
      where: {
        id: classId,
        status: { not: 'CANCELLED' },
      },
      include: {
        trainer: {
          select: {
            id: true,
            specialization: true,
            profileImageUrl: true,
          },
        },
      },
    });

    if (!liveClass) return null;

    const { meetingUrl, ...rest } = liveClass;
    return rest;
  },

  // Admin: get all classes
  getAdminClasses: async (): Promise<AdminLiveClassDto[]> => {
    const classes = await prisma.liveClass.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        trainer: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return classes;
  },

  // Admin: update class status
  updateClassStatus: async (classId: string, status: string): Promise<LiveClassResponseDto> => {
    const existing = await prisma.liveClass.findUnique({
      where: { id: classId },
    });

    if (!existing) {
      const error = new Error('Class not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    // Cancel logic
    const updated = await prisma.liveClass.update({
      where: { id: classId },
      data: { status: status as LiveClassStatus },
    });

    return updated;
  },

  // Trainer: get own verified specialization
  getTrainerSpecialization: async (userId: string): Promise<TrainerSpecializationResponseDto> => {
    const trainer = await resolveTrainer(userId);
    return { specialization: trainer.specialization };
  },

  // User: direct class join with subscription-to-trainer authorization
  joinClass: async (userId: string, classId: string): Promise<JoinLiveClassResponseDto> => {
    // 1. Find LiveClass by id with associated Trainer
    const liveClass = await prisma.liveClass.findUnique({
      where: { id: classId },
      include: { trainer: true },
    });

    if (!liveClass) {
      const error = new Error('Class not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    // 2. Reject CANCELLED class
    if (liveClass.status === LiveClassStatus.CANCELLED) {
      const error = new Error('This class has been cancelled.') as Error & { status: number };
      error.status = 409;
      throw error;
    }

    // 3. Require trainer to be active
    if (!liveClass.trainer || !liveClass.trainer.isActive) {
      const error = new Error('Trainer account is inactive.') as Error & { status: number };
      error.status = 403;
      throw error;
    }

    // 4. Find an ACTIVE, non-expired subscription whose plan.trainerId matches liveClass.trainerId
    const now = new Date();
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: now },
        plan: {
          trainerId: liveClass.trainerId,
        },
      },
    });

    if (!activeSubscription) {
      const error = new Error('An active subscription with this trainer is required to join this class.') as Error & { status: number };
      error.status = 403;
      throw error;
    }

    // 5. Enforce join window: earliest = startTime - 15 minutes, latest = endTime
    const startTime = new Date(liveClass.startTime);
    const endTime = new Date(liveClass.endTime);
    const joinStartTime = new Date(startTime.getTime() - 15 * 60000);

    if (now < joinStartTime) {
      const error = new Error('The class has not started yet. You can join up to 15 minutes before the start time.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    if (now > endTime) {
      const error = new Error('The class has already ended.') as Error & { status: number };
      error.status = 400;
      throw error;
    }

    // 6. Require meetingUrl
    if (!liveClass.meetingUrl) {
      const error = new Error('Meeting URL is not available for this class.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    // 7. Record successful join: idempotent upsert ClassBooking with status = ATTENDED
    await prisma.classBooking.upsert({
      where: {
        userId_liveClassId: {
          userId,
          liveClassId: classId,
        },
      },
      create: {
        userId,
        liveClassId: classId,
        status: BookingStatus.ATTENDED,
        bookedAt: now,
      },
      update: {
        status: BookingStatus.ATTENDED,
      },
    });

    // 8. Return meetingUrl
    return { meetingUrl: liveClass.meetingUrl };
  },
};
