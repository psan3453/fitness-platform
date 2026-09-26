import { z } from 'zod';
import { liveClassValidation } from './live-class.validation';
import { LiveClassCategory, LiveClassStatus } from '../../generated/prisma/enums';

export type CreateLiveClassRequestDto = z.infer<typeof liveClassValidation.createClassSchema>;
export type UpdateLiveClassRequestDto = z.infer<typeof liveClassValidation.updateClassSchema>;

export interface LiveClassResponseDto {
  id: string;
  trainerId: string;
  title: string;
  description: string | null;
  category: LiveClassCategory;
  startTime: Date;
  endTime: Date;
  capacity: number;
  meetingUrl: string | null;
  status: LiveClassStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveClassWithTrainerDto extends Omit<LiveClassResponseDto, 'meetingUrl'> {
  trainer: {
    id: string;
    specialization: string;
    profileImageUrl: string | null;
  };
}

export interface AdminLiveClassDto extends LiveClassResponseDto {
  trainer: {
    id: string;
    user: {
      email: string;
      profile: {
        firstName: string;
        lastName: string | null;
      } | null;
    };
  };
}

export interface JoinLiveClassResponseDto {
  meetingUrl: string;
}

export interface TrainerSpecializationResponseDto {
  specialization: LiveClassCategory;
}
