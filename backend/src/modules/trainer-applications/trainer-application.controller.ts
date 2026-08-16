import { Request, Response } from 'express';
import { z } from 'zod';
import { trainerApplicationService } from './trainer-application.service';
import { trainerApplicationValidation } from './trainer-application.validation';

export const trainerApplicationController = {
  createApplication: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const validatedData = trainerApplicationValidation.createApplicationSchema.parse(req.body);

      const application = await trainerApplicationService.createApplication(
        req.user.userId,
        validatedData,
      );

      res.status(201).json({ application });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }

      const err = error as Error & { status?: number };

      if (err.status === 409) {
        res.status(409).json({ message: err.message });
        return;
      }

      console.error('[trainerApplicationController.createApplication]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getMyApplications: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const applications = await trainerApplicationService.getMyApplications(req.user.userId);
      res.status(200).json({ applications });
    } catch (error: unknown) {
      console.error('[trainerApplicationController.getMyApplications]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
