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

export interface LiveClassWithTrainerDto extends LiveClassResponseDto {
  trainer: {
    id: string;
    specialization: string;
    profileImageUrl: string | null;
  };
}
