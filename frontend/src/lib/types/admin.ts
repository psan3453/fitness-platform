export type TrainerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminTrainerApplication {
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
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string | null;
    } | null;
  };
}

export interface AdminTrainerApplicationsResponse {
  applications: AdminTrainerApplication[];
}
