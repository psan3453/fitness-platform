import { Request, Response } from 'express';
import { z } from 'zod';
import { subscriptionService } from './subscription.service';
import { subscriptionValidation } from './subscription.validation';

export const subscriptionController = {
  createPlan: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = subscriptionValidation.createPlanSchema.parse(req.body);
      const plan = await subscriptionService.createPlan(validatedData);
      res.status(201).json(plan);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation failed', errors: error.issues });
        return;
      }
      console.error('[subscriptionController.createPlan]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getAllPlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const plans = await subscriptionService.getAllPlans();
      res.status(200).json({ plans });
    } catch (error: unknown) {
      console.error('[subscriptionController.getAllPlans]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updatePlan: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedData = subscriptionValidation.updatePlanSchema.parse(req.body);
      const plan = await subscriptionService.updatePlan(id, validatedData);
      res.status(200).json(plan);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation failed', errors: error.issues });
        return;
      }
      const err = error as Error & { status?: number };
      if (err.status === 404) {
        res.status(404).json({ message: err.message });
        return;
      }
      console.error('[subscriptionController.updatePlan]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getActivePlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const plans = await subscriptionService.getActivePlans();
      res.status(200).json({ plans });
    } catch (error: unknown) {
      console.error('[subscriptionController.getActivePlans]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getUserSubscriptions: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const subscriptions = await subscriptionService.getUserSubscriptions(userId);
      res.status(200).json({ subscriptions });
    } catch (error: unknown) {
      console.error('[subscriptionController.getUserSubscriptions]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getAllSubscriptions: async (req: Request, res: Response): Promise<void> => {
    try {
      const subscriptions = await subscriptionService.getAllSubscriptions();
      res.status(200).json({ subscriptions });
    } catch (error: unknown) {
      console.error('[subscriptionController.getAllSubscriptions]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
