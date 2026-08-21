import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { UserSubscriptionsResponse, UserSubscription } from '@/lib/types/dashboard';
import { SubscriptionPlansResponse, SubscriptionPlanDetail } from '@/lib/types/subscription';

// ── Data Fetching ────────────────────────────────────────────

async function fetchPlans(): Promise<SubscriptionPlanDetail[]> {
  try {
    const data = await fetchApi<SubscriptionPlansResponse>('/api/subscription-plans');
    return data.plans;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[subscriptions] plans fetch failed:', error.status, error.message);
    }
    return [];
  }
}

async function fetchMySubscriptions(): Promise<UserSubscription[]> {
  try {
    const data = await fetchApi<UserSubscriptionsResponse>('/api/subscriptions/me');
    return data.subscriptions;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[subscriptions] user subs fetch failed:', error.status, error.message);
    }
    return [];
  }
}

function findCurrentSubscription(subscriptions: UserSubscription[]): UserSubscription | null {
  const active = subscriptions.find((s) => s.status === 'ACTIVE');
  if (active) return active;
  const pending = subscriptions.find((s) => s.status === 'PENDING');
  if (pending) return pending;
  return subscriptions[0] ?? null; // most recent (already sorted desc by backend)
}

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  EXPIRED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700' },
};

// ── Page ─────────────────────────────────────────────────────

export default async function SubscriptionsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const [plans, subscriptions] = await Promise.all([
    fetchPlans(),
    fetchMySubscriptions(),
  ]);

  const currentSub = findCurrentSubscription(subscriptions);
  const style = currentSub ? statusStyles[currentSub.status] ?? statusStyles.EXPIRED : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* ── Header ──────────────────────────────────────── */}
        <section className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a fitness membership plan that fits your goals. Unlock live classes, expert trainers, and more.
          </p>
        </section>

        {/* ── Current Subscription ────────────────────────── */}
        <section className="mb-10">
          {currentSub && style ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Current Plan</p>
                  <h2 className="text-2xl font-bold text-gray-900">{currentSub.plan.name}</h2>
                </div>
                <span className={`inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                  {currentSub.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Started</p>
                  <p className="font-medium text-gray-900">{formatDate(currentSub.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ends</p>
                  <p className="font-medium text-gray-900">{formatDate(currentSub.endDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{currentSub.plan.durationDays} days</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">You don&apos;t have an active subscription yet.</p>
              <p className="text-sm text-gray-400 mt-1">Browse the plans below to get started.</p>
            </div>
          )}
        </section>

        {/* ── Available Plans ──────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>

          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan =
                  currentSub &&
                  currentSub.planId === plan.id &&
                  (currentSub.status === 'ACTIVE' || currentSub.status === 'PENDING');

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
                      isCurrentPlan ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'
                    }`}
                  >
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        {isCurrentPlan && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <span className="text-3xl font-extrabold text-gray-900">{formatPrice(plan.price)}</span>
                        <span className="text-gray-500 text-sm ml-1">/ {plan.durationDays} days</span>
                      </div>

                      {plan.description && (
                        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                      )}

                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-emerald-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Access to live classes
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-emerald-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Yoga, Zumba &amp; HIIT sessions
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-emerald-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {plan.durationDays}-day membership
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                      {isCurrentPlan ? (
                        <Link
                          href="/dashboard"
                          className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          Go to Dashboard
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-gray-500 bg-gray-200 cursor-not-allowed"
                        >
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No plans available</h3>
              <p className="text-gray-500 mb-6">
                No subscription plans are currently available. Check back later!
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
