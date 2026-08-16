import { Router } from 'express';
import { trainerApplicationController } from './trainer-application.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

router.post('/', requireAuth, trainerApplicationController.createApplication);
router.get('/me', requireAuth, trainerApplicationController.getMyApplications);

export default router;
