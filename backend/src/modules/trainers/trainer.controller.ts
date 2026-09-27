import { Request, Response } from 'express';
import { trainerService } from './trainer.service';

export const trainerDiscoveryController = {
  getTrainers: async (req: Request, res: Response): Promise<void> => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const specialization =
        typeof req.query.specialization === 'string' ? req.query.specialization : undefined;

      const trainers = await trainerService.getDiscoverableTrainers({
        search,
        specialization,
      });

      res.status(200).json({ trainers });
    } catch (error: unknown) {
      console.error('[trainerDiscoveryController.getTrainers]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getTrainerById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ message: 'Trainer ID is required.' });
        return;
      }

      const trainer = await trainerService.getTrainerProfileById(id);
      res.status(200).json({ trainer });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[trainerDiscoveryController.getTrainerById]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
