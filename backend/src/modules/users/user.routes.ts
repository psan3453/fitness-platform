import { Router } from 'express';
import { userController } from './user.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

router.get('/me/profile', requireAuth, userController.getProfile);
router.patch('/me/profile', requireAuth, userController.updateProfile);

export default router;
