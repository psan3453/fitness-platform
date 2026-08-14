import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth } from './auth.middleware';

const router = Router();

router.post('/register', authController.register);

// Routes will be implemented in future Checkpoints
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

export default router;
