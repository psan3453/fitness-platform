import { Router } from 'express';
import { adminController } from './admin.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { UserRole } from '../../generated/prisma/enums';

const router = Router();

router.get(
  '/trainer-applications',
  requireAuth,
  requireRole(UserRole.ADMIN),
  adminController.getTrainerApplications
);

router.patch(
  '/trainer-applications/:id/approve',
  requireAuth,
  requireRole(UserRole.ADMIN),
  adminController.approveTrainerApplication
);

router.patch(
  '/trainer-applications/:id/reject',
  requireAuth,
  requireRole(UserRole.ADMIN),
  adminController.rejectTrainerApplication
);

router.get(
  '/users',
  requireAuth,
  requireRole(UserRole.ADMIN),
  adminController.getUsers
);

router.patch(
  '/users/:id/active',
  requireAuth,
  requireRole(UserRole.ADMIN),
  adminController.toggleUserActive
);

export default router;
