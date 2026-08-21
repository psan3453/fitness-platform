export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null; // ISO string in JSON
  gender: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  profile: UserProfile;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null; // Coerced to Date on the backend
  gender?: string | null;
  bio?: string | null;
}
