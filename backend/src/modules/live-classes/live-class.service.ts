import { prisma } from '../../prisma';
import { CreateLiveClassRequestDto, UpdateLiveClassRequestDto, LiveClassResponseDto, LiveClassWithTrainerDto, AdminLiveClassDto } from './live-class.types';
import { LiveClassCategory, LiveClassStatus } from '../../generated/prisma/enums';

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

    return classes;
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

    return liveClass;
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
};
