import { Router } from 'express';
import { dietPlanController, trainerDietPlanController } from './diet-plan.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { UserRole } from '../../generated/prisma/enums';

// ============================================================
// ADMIN CREATOR ROUTES: ADMIN ONLY
// Mounted at: /api/diet-plans
// ============================================================
export const dietPlanCreatorRoutes = Router();

// POST /api/diet-plans
dietPlanCreatorRoutes.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN),
  dietPlanController.adminCreate
);

// GET /api/diet-plans/mine
dietPlanCreatorRoutes.get(
  '/mine',
  requireAuth,
  requireRole(UserRole.ADMIN),
  dietPlanController.adminGetPlans
);

// PATCH /api/diet-plans/:id
dietPlanCreatorRoutes.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  dietPlanController.adminUpdate
);

// DELETE /api/diet-plans/:id
dietPlanCreatorRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  dietPlanController.adminDelete
);

// ============================================================
// SUBSCRIBER CONSUMER ROUTES: AUTHENTICATED USERS
// Mounted at: /api/diet-plans
// ============================================================
export const dietPlanPublicRoutes = Router();

// GET /api/diet-plans
dietPlanPublicRoutes.get(
  '/',
  requireAuth,
  dietPlanController.getSubscriberPlans
);

// GET /api/diet-plans/:id
dietPlanPublicRoutes.get(
  '/:id',
  requireAuth,
  dietPlanController.getSubscriberPlanById
);

// ============================================================
// TRAINER MANAGEMENT ROUTES: TRAINER ONLY
// Mounted at: /api/trainer/diet-plans
// ============================================================
export const trainerDietPlanRoutes = Router();

// GET /api/trainer/diet-plans
trainerDietPlanRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerDietPlanController.getPlans
);

// POST /api/trainer/diet-plans
trainerDietPlanRoutes.post(
  '/',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerDietPlanController.createPlan
);

// GET /api/trainer/diet-plans/:id
trainerDietPlanRoutes.get(
  '/:id',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerDietPlanController.getPlanById
);

// PATCH /api/trainer/diet-plans/:id
trainerDietPlanRoutes.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerDietPlanController.updatePlan
);

// DELETE /api/trainer/diet-plans/:id
trainerDietPlanRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.TRAINER),
  trainerDietPlanController.deletePlan
);
