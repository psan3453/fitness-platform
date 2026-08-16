import { prisma } from '../../prisma';
import { CreateApplicationRequestDto, ApplicationResponseDto } from './trainer-application.types';

export const trainerApplicationService = {
  createApplication: async (userId: string, data: CreateApplicationRequestDto): Promise<ApplicationResponseDto> => {
    // Check for existing PENDING application
    const existingPending = await prisma.trainerApplication.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      const error = new Error('Your trainer application is already pending.') as Error & { status: number };
      error.status = 409;
      throw error;
    }

    const application = await prisma.trainerApplication.create({
      data: {
        userId,
        bio: data.bio ?? null,
        specialization: data.specialization,
        experience: data.experience ?? null,
        certifications: data.certifications ?? null,
        status: 'PENDING',
      },
    });

    return {
      id: application.id,
      userId: application.userId,
      bio: application.bio,
      specialization: application.specialization,
      experience: application.experience,
      certifications: application.certifications,
      status: application.status,
      rejectionReason: application.rejectionReason,
      reviewedAt: application.reviewedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  },

  getMyApplications: async (userId: string): Promise<ApplicationResponseDto[]> => {
    const applications = await prisma.trainerApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      userId: app.userId,
      bio: app.bio,
      specialization: app.specialization,
      experience: app.experience,
      certifications: app.certifications,
      status: app.status,
      rejectionReason: app.rejectionReason,
      reviewedAt: app.reviewedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));
  },
};
