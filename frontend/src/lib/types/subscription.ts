// Types for the subscription plans page.
// Reuses SubscriptionStatus, SubscriptionPlan, UserSubscription, UserSubscriptionsResponse
// from dashboard.ts for user subscriptions.
// This file adds the full SubscriptionPlanDetail type for GET /api/subscription-plans.

export interface SubscriptionPlanDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/subscription-plans response */
export interface SubscriptionPlansResponse {
  plans: SubscriptionPlanDetail[];
}
