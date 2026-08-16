import { Request, Response } from 'express';
import { z } from 'zod';
import { liveClassService } from './live-class.service';
import { liveClassValidation } from './live-class.validation';
import { LiveClassCategory } from '../../generated/prisma/enums';

export const liveClassController = {
  // Trainer: create class
  createClass: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }
      const validatedData = liveClassValidation.createClassSchema.parse(req.body);
      const liveClass = await liveClassService.createClass(userId, validatedData);
      res.status(201).json({ class: liveClass });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation failed', errors: error.issues });
        return;
      }
      const err = error as Error & { status?: number };
      if (err.status === 403) {
        res.status(403).json({ message: err.message });
        return;
      }
      console.error('[liveClassController.createClass]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Trainer: list own classes
  getTrainerClasses: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }
      const classes = await liveClassService.getTrainerClasses(userId);
      res.status(200).json({ classes });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status === 403) {
        res.status(403).json({ message: err.message });
        return;
      }
      console.error('[liveClassController.getTrainerClasses]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Trainer: update own class
  updateClass: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }
      const classId = req.params.id as string;
      const validatedData = liveClassValidation.updateClassSchema.parse(req.body);
      const updated = await liveClassService.updateClass(userId, classId, validatedData);
      res.status(200).json({ class: updated });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation failed', errors: error.issues });
        return;
      }
      const err = error as Error & { status?: number };
      if (err.status === 400 || err.status === 403 || err.status === 404) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[liveClassController.updateClass]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // User: discover classes
  discoverClasses: async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.query.category as string | undefined;
      
      if (category && !Object.values(LiveClassCategory).includes(category as LiveClassCategory)) {
        res.status(400).json({ message: 'Invalid category' });
        return;
      }

      const classes = await liveClassService.discoverClasses(category);
      res.status(200).json({ classes });
    } catch (error: unknown) {
      console.error('[liveClassController.discoverClasses]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // User: class details
  getClassDetails: async (req: Request, res: Response): Promise<void> => {
    try {
      const classId = req.params.id as string;
      const liveClass = await liveClassService.getClassDetails(classId);
      if (!liveClass) {
        res.status(404).json({ message: 'Class not found.' });
        return;
      }
      res.status(200).json({ class: liveClass });
    } catch (error: unknown) {
      console.error('[liveClassController.getClassDetails]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
