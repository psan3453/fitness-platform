import { LiveClassCategory, LiveClassStatus } from '../../generated/prisma/enums';

export interface TrainerSummaryDto {
  id: string;
  name: string;
  specialization: LiveClassCategory;
  bio: string | null;
  experience: string | null;
  profileImageUrl: string | null;
  activePlansCount: number;
  upcomingClassesCount: number;
  startingPrice: number | null;
}

export interface PublicSubscriptionPlanDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
}

export interface PublicLiveClassDto {
  id: string;
  title: string;
  description: string | null;
  category: LiveClassCategory;
  startTime: Date;
  endTime: Date;
  capacity: number;
  status: LiveClassStatus;
}

export interface TrainerProfileDto {
  id: string;
  name: string;
  specialization: LiveClassCategory;
  bio: string | null;
  experience: string | null;
  certifications: string | null;
  profileImageUrl: string | null;
  plans: PublicSubscriptionPlanDto[];
  upcomingClasses: PublicLiveClassDto[];
  dietPlansCount: number;
  offersDietPlans: boolean;
}

export interface TrainerDiscoveryQuery {
  search?: string;
  specialization?: string;
}
