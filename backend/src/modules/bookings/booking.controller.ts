import { Request, Response } from 'express';
import { bookingService } from './booking.service';

export const bookingController = {
  bookClass: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const classId = req.params.id as string;
      const booking = await bookingService.bookClass(userId, classId);
      res.status(201).json({ booking });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[bookingController.bookClass]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getMyBookings: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const result = await bookingService.getMyBookings(userId);
      res.status(200).json(result);
    } catch (error: unknown) {
      console.error('[bookingController.getMyBookings]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  cancelBooking: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const bookingId = req.params.id as string;
      const booking = await bookingService.cancelBooking(userId, bookingId);
      res.status(200).json({ booking });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      if (err.status && err.status >= 400 && err.status < 500) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error('[bookingController.cancelBooking]', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
