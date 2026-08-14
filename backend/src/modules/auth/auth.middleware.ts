import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../config/auth';
import { JwtPayload } from './auth.types';
import { UserRole } from '../../generated/prisma/enums';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const token = parts[1];
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, authConfig.jwt.accessSecret as string) as unknown;

    // Validate payload structure securely without `any`
    if (
      !decoded ||
      typeof decoded !== 'object' ||
      !('userId' in decoded) ||
      !('role' in decoded) ||
      typeof (decoded as Record<string, unknown>).userId !== 'string' ||
      typeof (decoded as Record<string, unknown>).role !== 'string' ||
      !Object.values(UserRole).includes((decoded as Record<string, unknown>).role as UserRole)
    ) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    // Attach strongly typed user to request
    req.user = {
      userId: (decoded as Record<string, unknown>).userId as string,
      role: (decoded as Record<string, unknown>).role as UserRole,
    };

    next();
  } catch (error: unknown) {
    // Catch JsonWebTokenError, TokenExpiredError, etc. and return generic 401
    res.status(401).json({ message: 'Authentication required.' });
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ message: 'Forbidden.' });
      return;
    }

    next();
  };
};
