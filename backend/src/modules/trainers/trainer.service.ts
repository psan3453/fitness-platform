import { prisma } from '../../prisma';
import { UserRole, LiveClassCategory, LiveClassStatus } from '../../generated/prisma/enums';
import {
  TrainerSummaryDto,
  TrainerProfileDto,
  TrainerDiscoveryQuery,
} from './trainer.types';

export const trainerService = {
  getDiscoverableTrainers: async (
    query: TrainerDiscoveryQuery
  ): Promise<TrainerSummaryDto[]> => {
    const now = new Date();
    const { search, specialization } = query;

    const where: any = {
      isActive: true,
      user: {
        isActive: true,
        role: UserRole.TRAINER,
      },
    };

    if (
      specialization &&
      specialization.toUpperCase() !== 'ALL' &&
      Object.values(LiveClassCategory).includes(
        specialization.toUpperCase() as LiveClassCategory
      )
    ) {
      where.specialization = specialization.toUpperCase() as LiveClassCategory;
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        {
          user: {
            profile: {
              firstName: {
                contains: term,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          user: {
            profile: {
              lastName: {
                contains: term,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          bio: {
            contains: term,
            mode: 'insensitive',
          },
        },
      ];
    }

    const trainers = await prisma.trainer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
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
        subscriptionPlans: {
          where: { isActive: true },
          select: { price: true },
        },
        liveClasses: {
          where: {
            status: { in: [LiveClassStatus.SCHEDULED, LiveClassStatus.LIVE] },
            endTime: { gt: now },
          },
          select: { id: true },
        },
      },
    });

    return trainers.map((t) => {
      const profile = t.user.profile;
      const trainerName = profile
        ? `${profile.firstName} ${profile.lastName || ''}`.trim()
        : t.user.email.split('@')[0] || 'Trainer';

      const prices = t.subscriptionPlans.map((p) => Number(p.price));
      const startingPrice = prices.length > 0 ? Math.min(...prices) : null;

      return {
        id: t.id,
        name: trainerName,
        specialization: t.specialization,
        bio: t.bio,
        experience: t.experience,
        profileImageUrl: t.profileImageUrl || profile?.avatarUrl || null,
        activePlansCount: t.subscriptionPlans.length,
        upcomingClassesCount: t.liveClasses.length,
        startingPrice,
      };
    });
  },

  getTrainerProfileById: async (
    trainerId: string
  ): Promise<TrainerProfileDto> => {
    const now = new Date();

    const trainer = await prisma.trainer.findFirst({
      where: {
        id: trainerId,
        isActive: true,
        user: {
          isActive: true,
          role: UserRole.TRAINER,
        },
      },
      include: {
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
        subscriptionPlans: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationDays: true,
            isActive: true,
          },
        },
        liveClasses: {
          where: {
            status: { in: [LiveClassStatus.SCHEDULED, LiveClassStatus.LIVE] },
            endTime: { gt: now },
          },
          orderBy: { startTime: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            startTime: true,
            endTime: true,
            capacity: true,
            status: true,
            // meetingUrl is STRICTLY EXCLUDED
          },
        },
        dietPlans: {
          where: { isActive: true },
          select: { id: true },
          // meal items are STRICTLY EXCLUDED
        },
      },
    });

    if (!trainer) {
      const error = new Error('Trainer not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    const profile = trainer.user.profile;
    const trainerName = profile
      ? `${profile.firstName} ${profile.lastName || ''}`.trim()
      : trainer.user.email.split('@')[0] || 'Trainer';

    return {
      id: trainer.id,
      name: trainerName,
      specialization: trainer.specialization,
      bio: trainer.bio,
      experience: trainer.experience,
      certifications: trainer.certifications,
      profileImageUrl: trainer.profileImageUrl || profile?.avatarUrl || null,
      plans: trainer.subscriptionPlans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        durationDays: p.durationDays,
        isActive: p.isActive,
      })),
      upcomingClasses: trainer.liveClasses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        startTime: c.startTime,
        endTime: c.endTime,
        capacity: c.capacity,
        status: c.status,
      })),
      dietPlansCount: trainer.dietPlans.length,
      offersDietPlans: trainer.dietPlans.length > 0,
    };
  },
};
