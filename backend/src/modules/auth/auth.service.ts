import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../prisma';
import { authConfig } from '../../config/auth';
import { RegisterRequestDto, LoginRequestDto, TokenRequestDto, AuthTokens, SafeUser } from './auth.types';
import { UserRole } from '../../generated/prisma/enums';

function parseDurationToDate(duration: string): Date {
  const match = duration.match(/^(\d+)([smhd])$/);
  const now = new Date();
  if (!match) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return new Date(now.getTime() + value * 1000);
    case 'm': return new Date(now.getTime() + value * 60 * 1000);
    case 'h': return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd': return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}

export const authService = {
  registerUser: async (data: RegisterRequestDto): Promise<{ user: SafeUser; tokens: AuthTokens }> => {
    // 1. Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const error = new Error('An account with this email already exists.') as Error & { status: number };
      error.status = 409;
      throw error;
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(data.password, authConfig.bcrypt.saltRounds);

    // 3. Generate tokens
    // We generate them early so we can insert the session within the transaction.
    // However, JWT needs the user ID. We can generate a UUID for the user upfront,
    // or let Prisma generate it and then generate the tokens. 
    // We'll generate a random UUID for the user ID to maintain transaction purity.
    const userId = crypto.randomUUID();

    // Access token
    const accessToken = jwt.sign(
      { userId, role: UserRole.USER },
      authConfig.jwt.accessSecret as string,
      { expiresIn: authConfig.jwt.accessExpiresIn as string | number | undefined } as jwt.SignOptions
    );

    // Refresh token - using crypto random string for better security against offline cracking than standard JWTs
    // JWTs are fine too, but opaque tokens are standard for refresh tokens.
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Hash refresh token for DB storage using SHA-256
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Parse refresh expiration dynamically to calculate the Date object
    const expiresAt = parseDurationToDate(authConfig.jwt.refreshExpiresIn); 

    // 4. Transaction: Create User, Profile, and UserSession atomically
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email: data.email,
          passwordHash,
          role: UserRole.USER, // Explicitly hardcoded, ignoring any client input
          profile: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              dateOfBirth: data.dateOfBirth,
              gender: data.gender,
              bio: data.bio,
            },
          },
          sessions: {
            create: {
              refreshTokenHash,
              expiresAt,
            }
          }
        },
        include: {
          profile: true,
        },
      });
      return newUser;
    });

    // 5. Construct safe user response
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profile: user.profile ? {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      } : null,
    };

    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  loginUser: async (data: LoginRequestDto): Promise<{ user: SafeUser; tokens: AuthTokens }> => {
    const genericAuthError = new Error('Invalid email or password.') as Error & { status: number };
    genericAuthError.status = 401;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { profile: true },
    });

    if (!user) {
      throw genericAuthError;
    }

    // 2. Check if active
    if (!user.isActive) {
      throw genericAuthError;
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw genericAuthError;
    }

    // 4. Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      authConfig.jwt.accessSecret as string,
      { expiresIn: authConfig.jwt.accessExpiresIn as string | number | undefined } as jwt.SignOptions
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = parseDurationToDate(authConfig.jwt.refreshExpiresIn); 

    // 5. Create session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      }
    });

    // 6. Return safe user
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profile: user.profile ? {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      } : null,
    };

    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  },

  refreshToken: async (data: TokenRequestDto): Promise<AuthTokens> => {
    const genericAuthError = new Error('Invalid refresh token.') as Error & { status: number };
    genericAuthError.status = 401;

    const { refreshToken } = data;
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // 1. Find session
    const session = await prisma.userSession.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw genericAuthError;
    }

    const { user } = session;
    if (!user || !user.isActive) {
      throw genericAuthError;
    }

    // 2. Generate new tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      authConfig.jwt.accessSecret as string,
      { expiresIn: authConfig.jwt.accessExpiresIn as string | number | undefined } as jwt.SignOptions
    );

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    const newExpiresAt = parseDurationToDate(authConfig.jwt.refreshExpiresIn);

    // 3. Atomically revoke old session and create new one
    await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.userSession.updateMany({
        where: {
          id: session.id,
          revokedAt: null, // Ensure it wasn't revoked in a race condition
        },
        data: {
          revokedAt: new Date(),
        },
      });

      if (updatedSession.count === 0) {
        throw genericAuthError;
      }

      await tx.userSession.create({
        data: {
          userId: user.id,
          refreshTokenHash: newRefreshTokenHash,
          expiresAt: newExpiresAt,
        },
      });
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },

  logout: async (data: TokenRequestDto): Promise<void> => {
    const { refreshToken } = data;
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await prisma.userSession.findUnique({
      where: { refreshTokenHash },
    });

    if (session && !session.revokedAt) {
      await prisma.userSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }
  },

  getCurrentUser: async (userId: string): Promise<SafeUser> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      const error: Error & { status?: number } = new Error('Authentication required.');
      error.status = 401;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profile: user.profile ? {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      } : null,
    };
  },
};
