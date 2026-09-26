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
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
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

  // Trainer: get own class details
  getTrainerClassById: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }
      const classId = req.params.id as string;
      const liveClass = await liveClassService.getTrainerClassById(userId, classId);
      res.status(200).json({ class: liveClass });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[liveClassController.getTrainerClassById]', error);
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

  // Admin: get all classes
  getAdminClasses: async (req: Request, res: Response): Promise<void> => {
    try {
      const classes = await liveClassService.getAdminClasses();
      res.status(200).json({ classes });
    } catch (error: unknown) {
      console.error('[liveClassController.getAdminClasses]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Admin: update class status
  updateClassStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const classId = req.params.id as string;
      const validatedData = liveClassValidation.updateClassStatusSchema.parse(req.body);
      const updated = await liveClassService.updateClassStatus(classId, validatedData.status);
      res.status(200).json({ class: updated });
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
      console.error('[liveClassController.updateClassStatus]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Trainer: get own verified specialization
  getTrainerSpecialization: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }
      const result = await liveClassService.getTrainerSpecialization(userId);
      res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[liveClassController.getTrainerSpecialization]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // User: direct class join
  joinClass: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }
      const classId = req.params.id as string;
      const result = await liveClassService.joinClass(userId, classId);
      res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[liveClassController.joinClass]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
