import { Router } from 'express';
import { trainerPlanController } from './trainer-plan.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { UserRole } from '../../generated/prisma/enums';

export const trainerPlanRoutes = Router();

trainerPlanRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerPlanController.getPlans
);

trainerPlanRoutes.post(
  '/',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerPlanController.createPlan
);

trainerPlanRoutes.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerPlanController.updatePlan
);

trainerPlanRoutes.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerPlanController.updatePlanStatus
);
