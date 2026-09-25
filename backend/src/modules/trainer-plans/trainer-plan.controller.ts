import { Request, Response } from 'express';
import { z } from 'zod';
import { trainerPlanService } from './trainer-plan.service';
import { trainerPlanValidation } from './trainer-plan.validation';

export const trainerPlanController = {
  getPlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const plans = await trainerPlanService.getPlans(userId);
      res.status(200).json({ plans });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[trainerPlanController.getPlans]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  createPlan: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const validatedData = trainerPlanValidation.createTrainerPlanSchema.parse(req.body);
      const plan = await trainerPlanService.createPlan(userId, validatedData);
      res.status(201).json({ plan });
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
      console.error('[trainerPlanController.createPlan]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updatePlan: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const planId = req.params.id as string;
      const validatedData = trainerPlanValidation.updateTrainerPlanSchema.parse(req.body);
      const plan = await trainerPlanService.updatePlan(userId, planId, validatedData);
      res.status(200).json({ plan });
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
      console.error('[trainerPlanController.updatePlan]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updatePlanStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const planId = req.params.id as string;
      const validatedData = trainerPlanValidation.updateTrainerPlanStatusSchema.parse(req.body);
      const plan = await trainerPlanService.updatePlanStatus(userId, planId, validatedData);
      res.status(200).json({ plan });
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
      console.error('[trainerPlanController.updatePlanStatus]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
