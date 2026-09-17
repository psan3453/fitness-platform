import { Request, Response } from 'express';
import { z } from 'zod';
import { paymentService } from './payment.service';
import { paymentValidation } from './payment.validation';

export const paymentController = {
  createOrder: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const validatedData = paymentValidation.createOrderSchema.parse(req.body);
      const order = await paymentService.createOrder(userId, validatedData);
      res.status(201).json(order);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation failed', errors: error.issues });
        return;
      }
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      if (err.status && err.status >= 500 && err.status < 600) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[paymentController.createOrder]', error instanceof Error ? error.message : 'Unknown error');
      res.status(500).json({ message: 'Failed to create payment order.' });
    }
  },
};
