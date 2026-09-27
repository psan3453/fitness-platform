export type TrainerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LiveClassCategory = 'YOGA' | 'ZUMBA' | 'HIIT';

export interface TrainerApplication {
  id: string;
  userId: string;
  bio: string | null;
  specialization: string;
  experience: string | null;
  certifications: string | null;
  status: TrainerApplicationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerApplicationsResponse {
  applications: TrainerApplication[];
}

export interface TrainerApplicationResponse {
  application: TrainerApplication;
}

export interface TrainerSummary {
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

export interface PublicSubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
}

export interface PublicLiveClass {
  id: string;
  title: string;
  description: string | null;
  category: LiveClassCategory;
  startTime: string;
  endTime: string;
  capacity: number;
  status: string;
}

export interface TrainerProfile {
  id: string;
  name: string;
  specialization: LiveClassCategory;
  bio: string | null;
  experience: string | null;
  certifications: string | null;
  profileImageUrl: string | null;
  plans: PublicSubscriptionPlan[];
  upcomingClasses: PublicLiveClass[];
  dietPlansCount: number;
  offersDietPlans: boolean;
}

export interface TrainersResponse {
  trainers: TrainerSummary[];
}

export interface TrainerProfileResponse {
  trainer: TrainerProfile;
}
