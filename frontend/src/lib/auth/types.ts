export interface SafeUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  profile: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseDto {
  user: SafeUser;
  tokens: AuthTokens;
}

export interface RegisterResponseDto {
  user: SafeUser;
  tokens: AuthTokens;
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface ActionState {
  error?: string;
}
