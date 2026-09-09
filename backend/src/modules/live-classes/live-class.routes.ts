import { Router } from 'express';
import { liveClassController } from './live-class.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { UserRole } from '../../generated/prisma/enums';

// Trainer routes: /api/trainer/classes
export const trainerClassRoutes = Router();

trainerClassRoutes.post(
  '/',
  requireAuth,
  requireRole(UserRole.TRAINER),
  liveClassController.createClass
);

trainerClassRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.TRAINER),
  liveClassController.getTrainerClasses
);

trainerClassRoutes.get(
  '/:id',
  requireAuth,
  requireRole(UserRole.TRAINER),
  liveClassController.getTrainerClassById
);

trainerClassRoutes.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.TRAINER),
  liveClassController.updateClass
);

// User routes: /api/classes
export const userClassRoutes = Router();

userClassRoutes.get(
  '/',
  requireAuth,
  liveClassController.discoverClasses
);

userClassRoutes.get(
  '/:id',
  requireAuth,
  liveClassController.getClassDetails
);

// Admin routes: /api/admin/classes
export const adminClassRoutes = Router();

adminClassRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN),
  liveClassController.getAdminClasses
);

adminClassRoutes.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.ADMIN),
  liveClassController.updateClassStatus
);
