// Types for the subscription plans page.
// Reuses SubscriptionStatus, SubscriptionPlan, UserSubscription, UserSubscriptionsResponse
// from dashboard.ts for user subscriptions.
// This file adds the full SubscriptionPlanDetail type for GET /api/subscription-plans.

export interface TrainerSummary {
  id: string;
  name: string;
  specialization: string;
  profileImageUrl: string | null;
}

export interface SubscriptionPlanDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
  trainerId?: string | null;
  trainer?: TrainerSummary | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/subscription-plans response */
export interface SubscriptionPlansResponse {
  plans: SubscriptionPlanDetail[];
}

import { UserSubscription } from './dashboard';

export interface AdminSubscription extends UserSubscription {
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string | null;
    } | null;
  };
}

export interface AdminSubscriptionsResponse {
  subscriptions: AdminSubscription[];
}
