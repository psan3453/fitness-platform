import { Request, Response } from 'express';
import { z } from 'zod';
import { adminService } from './admin.service';
import { adminValidation } from './admin.validation';

export const adminController = {
  getTrainerApplications: async (req: Request, res: Response): Promise<void> => {
    try {
      const applications = await adminService.getTrainerApplications();
      res.status(200).json({ applications });
    } catch (error: unknown) {
      console.error('[adminController.getTrainerApplications]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  approveTrainerApplication: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = await adminService.approveTrainerApplication(id);
      res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status === 404) {
        res.status(404).json({ message: err.message });
        return;
      }
      if (err.status === 409 || err.status === 400) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[adminController.approveTrainerApplication]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  rejectTrainerApplication: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validatedData = adminValidation.rejectApplicationSchema.parse(req.body);
      const result = await adminService.rejectTrainerApplication(id, validatedData);
      res.status(200).json(result);
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
      if (err.status === 409 || err.status === 400) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[adminController.rejectTrainerApplication]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
