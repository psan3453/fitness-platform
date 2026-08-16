import { z } from 'zod';
import { userValidation } from './user.validation';

export type UpdateProfileRequestDto = z.infer<typeof userValidation.updateProfileSchema>;

export interface ProfileResponseDto {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}
