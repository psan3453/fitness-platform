import { Router } from 'express';
import { bookingController } from './booking.controller';
import { requireAuth } from '../auth/auth.middleware';

export const bookingActionRoutes = Router();
export const bookingRoutes = Router();

// /api/classes/:id/book
bookingActionRoutes.post(
  '/:id/book',
  requireAuth,
  bookingController.bookClass
);

// /api/bookings/me
bookingRoutes.get(
  '/me',
  requireAuth,
  bookingController.getMyBookings
);

// /api/bookings/:id/cancel
bookingRoutes.patch(
  '/:id/cancel',
  requireAuth,
  bookingController.cancelBooking
);
