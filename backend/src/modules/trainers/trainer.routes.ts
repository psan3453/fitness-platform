import { Router } from 'express';
import { trainerDiscoveryController } from './trainer.controller';

export const trainerDiscoveryRoutes = Router();

// Public discovery endpoints
trainerDiscoveryRoutes.get('/', trainerDiscoveryController.getTrainers);
trainerDiscoveryRoutes.get('/:id', trainerDiscoveryController.getTrainerById);
