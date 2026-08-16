import { Request, Response } from 'express';
import { dietPlanService } from './diet-plan.service';
import { dietPlanValidation } from './diet-plan.validation';
import { ZodError } from 'zod';

export const dietPlanController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const parsed = dietPlanValidation.createSchema.parse(req.body);
      const plan = await dietPlanService.create(userId, parsed);
      res.status(201).json({ dietPlan: plan });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Validation failed.', errors: error.issues });
        return;
      }
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[dietPlanController.create]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getActivePlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const plans = await dietPlanService.getActivePlans();
      res.status(200).json({ dietPlans: plans });
    } catch (error: unknown) {
      console.error('[dietPlanController.getActivePlans]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getActivePlanById: async (req: Request, res: Response): Promise<void> => {
    try {
      const plan = await dietPlanService.getActivePlanById(req.params.id as string);
      if (!plan) {
        res.status(404).json({ message: 'Diet plan not found.' });
        return;
      }
      res.status(200).json({ dietPlan: plan });
    } catch (error: unknown) {
      console.error('[dietPlanController.getActivePlanById]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getMyPlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId || !role) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const plans = await dietPlanService.getMyPlans(userId, role);
      res.status(200).json({ dietPlans: plans });
    } catch (error: unknown) {
      console.error('[dietPlanController.getMyPlans]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId || !role) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const parsed = dietPlanValidation.updateSchema.parse(req.body);
      const plan = await dietPlanService.update(req.params.id as string, userId, role, parsed);
      res.status(200).json({ dietPlan: plan });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: 'Validation failed.', errors: error.issues });
        return;
      }
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[dietPlanController.update]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId || !role) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      await dietPlanService.delete(req.params.id as string, userId, role);
      res.status(200).json({ message: 'Diet plan deleted successfully.' });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[dietPlanController.delete]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
