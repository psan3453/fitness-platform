export type TrainerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
