import { Request, Response } from 'express';
import { z } from 'zod';
import { userService } from './user.service';
import { userValidation } from './user.validation';

export const userController = {
  getProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const profile = await userService.getProfile(req.user.userId);
      res.status(200).json({ profile });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      
      if (err.status === 404) {
        res.status(404).json({ message: err.message });
        return;
      }

      console.error('[userController.getProfile]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updateProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      if (Object.keys(req.body).length === 0) {
        res.status(400).json({ message: 'Request body cannot be empty.' });
        return;
      }

      const validatedData = userValidation.updateProfileSchema.parse(req.body);

      const profile = await userService.updateProfile(req.user.userId, validatedData);
      res.status(200).json({ profile });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: error.issues,
        });
        return;
      }

      const err = error as Error & { status?: number };
      
      if (err.status === 404) {
        res.status(404).json({ message: err.message });
        return;
      }

      console.error('[userController.updateProfile]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
