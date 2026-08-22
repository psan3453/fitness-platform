import { prisma } from '../../prisma';
import { RejectApplicationRequestDto, AdminTrainerApplicationResponseDto, AdminUserResponseDto } from './admin.types';
import { UserRole } from '../../generated/prisma/enums';

export const adminService = {
  getTrainerApplications: async (): Promise<AdminTrainerApplicationResponseDto[]> => {
    const applications = await prisma.trainerApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
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
    });
    // The cast here is safe assuming Prisma types align well enough with our interface, 
    // but mapping is better for precise control. Since Prisma returns a complex type,
    // mapping it guarantees exact adherence to the interface.
    return applications.map(app => ({
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
        user: {
            id: app.user.id,
            email: app.user.email,
            profile: app.user.profile
        }
    }));
  },

  approveTrainerApplication: async (applicationId: string) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Find the application by ID
      const application = await tx.trainerApplication.findUnique({
        where: { id: applicationId },
        include: { user: { include: { trainer: true } } },
      });

      // 2. Verify it exists
      if (!application) {
        const error = new Error('Trainer application not found.') as Error & { status: number };
        error.status = 404;
        throw error;
      }

      // 3. Verify status is PENDING
      if (application.status !== 'PENDING') {
        const error = new Error('Only pending applications can be approved.') as Error & { status: number };
        error.status = 409;
        throw error;
      }

      // 4. Verify the associated User exists and is active
      if (!application.user || !application.user.isActive) {
        const error = new Error('Associated user is inactive or not found.') as Error & { status: number };
        error.status = 400; 
        throw error;
      }

      // 5. Ensure the user does not already have a Trainer record
      if (application.user.trainer) {
        const error = new Error('User is already a trainer.') as Error & { status: number };
        error.status = 409;
        throw error;
      }

      const now = new Date();

      // 6. Update the TrainerApplication
      const updatedApplication = await tx.trainerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewedAt: now,
        },
      });

      // 7. Update User
      await tx.user.update({
        where: { id: application.userId },
        data: {
          role: UserRole.TRAINER,
        },
      });

      // 8. Create Trainer using application data
      const newTrainer = await tx.trainer.create({
        data: {
          userId: application.userId,
          bio: application.bio,
          specialization: application.specialization,
          experience: application.experience,
          certifications: application.certifications,
          profileImageUrl: null,
          isActive: true,
        },
      });

      // 9. Return safely
      return { application: updatedApplication, trainer: newTrainer };
    });
  },

  rejectTrainerApplication: async (applicationId: string, data: RejectApplicationRequestDto) => {
    return await prisma.$transaction(async (tx) => {
      const application = await tx.trainerApplication.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        const error = new Error('Trainer application not found.') as Error & { status: number };
        error.status = 404;
        throw error;
      }

      if (application.status !== 'PENDING') {
        const error = new Error('Only pending applications can be rejected.') as Error & { status: number };
        error.status = 409;
        throw error;
      }

      const updatedApplication = await tx.trainerApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          rejectionReason: data.rejectionReason,
          reviewedAt: new Date(),
        },
      });

      return { application: updatedApplication };
    });
  },

  getUsers: async (): Promise<AdminUserResponseDto[]> => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
    }));
  },

  toggleUserActive: async (userId: string, isActive: boolean) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error('User not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    if (user.role === UserRole.ADMIN) {
      const error = new Error('Cannot change the status of an admin user.') as Error & { status: number };
      error.status = 403;
      throw error;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { user: updatedUser };
  },
};
