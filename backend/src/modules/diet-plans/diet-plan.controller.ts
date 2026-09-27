import { Request, Response } from 'express';
import { dietPlanService } from './diet-plan.service';
import { dietPlanValidation } from './diet-plan.validation';
import { ZodError } from 'zod';

export const dietPlanController = {
  // ============================================================
  // SUBSCRIBER / USER HANDLERS
  // ============================================================

  getSubscriberPlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const plans = await dietPlanService.getSubscriberPlans(userId);
      res.status(200).json({ dietPlans: plans });
    } catch (error: unknown) {
      console.error('[dietPlanController.getSubscriberPlans]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getSubscriberPlanById: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const planId = req.params.id as string;
      const plan = await dietPlanService.getSubscriberPlanById(userId, planId);
      res.status(200).json({ dietPlan: plan });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[dietPlanController.getSubscriberPlanById]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // ============================================================
  // ADMIN HANDLERS
  // ============================================================

  adminCreate: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const parsed = dietPlanValidation.createSchema.parse(req.body);
      const plan = await dietPlanService.adminCreatePlan(userId, parsed);
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
      console.error('[dietPlanController.adminCreate]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  adminGetPlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const plans = await dietPlanService.adminGetAllPlans();
      res.status(200).json({ dietPlans: plans });
    } catch (error: unknown) {
      console.error('[dietPlanController.adminGetPlans]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  adminUpdate: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const planId = req.params.id as string;
      const parsed = dietPlanValidation.updateSchema.parse(req.body);
      const plan = await dietPlanService.adminUpdatePlan(planId, parsed);
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
      console.error('[dietPlanController.adminUpdate]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  adminDelete: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const planId = req.params.id as string;
      await dietPlanService.adminDeletePlan(planId);
      res.status(200).json({ message: 'Diet plan deleted successfully.' });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[dietPlanController.adminDelete]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export const trainerDietPlanController = {
  // ============================================================
  // TRAINER HANDLERS
  // ============================================================

  getPlans: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const plans = await dietPlanService.getTrainerPlans(userId);
      res.status(200).json({ dietPlans: plans });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[trainerDietPlanController.getPlans]', error);
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

      const parsed = dietPlanValidation.createSchema.parse(req.body);
      const plan = await dietPlanService.createTrainerPlan(userId, parsed);
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
      console.error('[trainerDietPlanController.createPlan]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getPlanById: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const planId = req.params.id as string;
      const plan = await dietPlanService.getTrainerPlanById(userId, planId);
      res.status(200).json({ dietPlan: plan });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[trainerDietPlanController.getPlanById]', error);
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
      const parsed = dietPlanValidation.updateSchema.parse(req.body);
      const plan = await dietPlanService.updateTrainerPlan(userId, planId, parsed);
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
      console.error('[trainerDietPlanController.updatePlan]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  deletePlan: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const planId = req.params.id as string;
      await dietPlanService.deleteTrainerPlan(userId, planId);
      res.status(200).json({ message: 'Diet plan deleted successfully.' });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[trainerDietPlanController.deletePlan]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
