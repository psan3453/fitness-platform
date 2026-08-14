import { z } from 'zod';
import { authValidation } from './auth.validation';
import { UserRole } from '../../generated/prisma/enums';

export type RegisterRequestDto = z.infer<typeof authValidation.registerSchema>;
export type LoginRequestDto = z.infer<typeof authValidation.loginSchema>;
export type TokenRequestDto = z.infer<typeof authValidation.tokenSchema>;

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
}
