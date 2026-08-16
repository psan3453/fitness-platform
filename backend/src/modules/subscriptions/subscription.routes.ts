import { Router } from 'express';
import { subscriptionController } from './subscription.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { UserRole } from '../../generated/prisma/enums';

export const adminSubscriptionPlanRoutes = Router();
export const userSubscriptionPlanRoutes = Router();
export const userSubscriptionRoutes = Router();

// ADMIN: /api/admin/subscription-plans
adminSubscriptionPlanRoutes.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN),
  subscriptionController.createPlan
);

adminSubscriptionPlanRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN),
  subscriptionController.getAllPlans
);

adminSubscriptionPlanRoutes.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  subscriptionController.updatePlan
);

// USER: /api/subscription-plans
userSubscriptionPlanRoutes.get(
  '/',
  requireAuth,
  subscriptionController.getActivePlans
);

// USER: /api/subscriptions
userSubscriptionRoutes.get(
  '/me',
  requireAuth,
  subscriptionController.getUserSubscriptions
);
