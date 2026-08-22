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

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: {
    firstName: string;
    lastName: string | null;
  } | null;
}

export interface AdminUsersResponse {
  users: AdminUser[];
}
