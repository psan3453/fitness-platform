// Types matching the exact backend response shapes for dashboard data fetching.
// These mirror the backend DTOs without importing from the backend directly.

// --- Subscription types ---

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  trainerId?: string | null;
}

export interface UserSubscription {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
}

/** GET /api/subscriptions/me response */
export interface UserSubscriptionsResponse {
  subscriptions: UserSubscription[];
}

// --- Booking / LiveClass types ---

export type BookingStatus = 'BOOKED' | 'CANCELLED' | 'ATTENDED';
export type LiveClassCategory = 'YOGA' | 'ZUMBA' | 'HIIT';
export type LiveClassStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface BookingLiveClass {
  id: string;
  title: string;
  description: string | null;
  category: LiveClassCategory;
  startTime: string;
  endTime: string;
  capacity: number;
  status: LiveClassStatus;
}

export interface UserBooking {
  id: string;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt: string | null;
  liveClassId: string;
  liveClass: BookingLiveClass;
}

/** GET /api/bookings/me response */
export interface UserBookingsResponse {
  bookings: UserBooking[];
}
