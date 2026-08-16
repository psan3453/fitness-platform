import { prisma } from '../../prisma';
import { UpdateProfileRequestDto, ProfileResponseDto } from './user.types';

export const userService = {
  getProfile: async (userId: string): Promise<ProfileResponseDto> => {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const error = new Error('Profile not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      bio: profile.bio,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  },

  updateProfile: async (userId: string, data: UpdateProfileRequestDto): Promise<ProfileResponseDto> => {
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      const error = new Error('Profile not found.') as Error & { status: number };
      error.status = 404;
      throw error;
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data,
    });

    return {
      id: updatedProfile.id,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      phone: updatedProfile.phone,
      avatarUrl: updatedProfile.avatarUrl,
      dateOfBirth: updatedProfile.dateOfBirth,
      gender: updatedProfile.gender,
      bio: updatedProfile.bio,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt,
    };
  }
};
