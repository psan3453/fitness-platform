import { Router } from 'express';
import { paymentController } from './payment.controller';
import { requireAuth } from '../auth/auth.middleware';

export const paymentRoutes = Router();

// POST /api/payments/create-order
paymentRoutes.post(
  '/create-order',
  requireAuth,
  paymentController.createOrder
);
