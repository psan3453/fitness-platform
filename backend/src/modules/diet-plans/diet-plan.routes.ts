import { Router } from 'express';
import { dietPlanController } from './diet-plan.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { UserRole } from '../../generated/prisma/enums';

// Creator routes: ADMIN and TRAINER only
export const dietPlanCreatorRoutes = Router();

// POST /api/diet-plans
dietPlanCreatorRoutes.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.TRAINER),
  dietPlanController.create
);

// GET /api/diet-plans/mine
dietPlanCreatorRoutes.get(
  '/mine',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.TRAINER),
  dietPlanController.getMyPlans
);

// PATCH /api/diet-plans/:id
dietPlanCreatorRoutes.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.TRAINER),
  dietPlanController.update
);

// DELETE /api/diet-plans/:id
dietPlanCreatorRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.TRAINER),
  dietPlanController.delete
);

// Public authenticated user routes
export const dietPlanPublicRoutes = Router();

// GET /api/diet-plans
dietPlanPublicRoutes.get(
  '/',
  requireAuth,
  dietPlanController.getActivePlans
);

// GET /api/diet-plans/:id
dietPlanPublicRoutes.get(
  '/:id',
  requireAuth,
  dietPlanController.getActivePlanById
);
