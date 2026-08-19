import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import type {
  UserSubscriptionsResponse,
  UserSubscription,
  UserBookingsResponse,
  UserBooking,
} from '@/lib/types/dashboard';

// ─── Helpers ────────────────────────────────────────────────────────

function findCurrentSubscription(
  subscriptions: UserSubscription[]
): UserSubscription | null {
  // Priority: ACTIVE > PENDING > most recent EXPIRED/CANCELLED
  const active = subscriptions.find((s) => s.status === 'ACTIVE');
  if (active) return active;
  const pending = subscriptions.find((s) => s.status === 'PENDING');
  if (pending) return pending;
  return null;
}

function getUpcomingBookings(bookings: UserBooking[]): UserBooking[] {
  const now = new Date();
  return bookings
    .filter(
      (b) =>
        b.status === 'BOOKED' && new Date(b.liveClass.startTime) > now
    )
    .sort(
      (a, b) =>
        new Date(a.liveClass.startTime).getTime() -
        new Date(b.liveClass.startTime).getTime()
    )
    .slice(0, 5);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const categoryColors: Record<string, { bg: string; text: string; accent: string }> = {
  YOGA: { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'bg-emerald-100' },
  ZUMBA: { bg: 'bg-pink-50', text: 'text-pink-700', accent: 'bg-pink-100' },
  HIIT: { bg: 'bg-orange-50', text: 'text-orange-700', accent: 'bg-orange-100' },
};

const statusBadge: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  EXPIRED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700' },
};

// ─── Data Fetching ──────────────────────────────────────────────────

async function fetchSubscriptions(): Promise<UserSubscription[]> {
  try {
    const data = await fetchApi<UserSubscriptionsResponse>('/api/subscriptions/me');
    return data.subscriptions;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[dashboard] subscriptions fetch failed:', error.status, error.message);
    }
    return [];
  }
}

async function fetchBookings(): Promise<UserBooking[]> {
  try {
    const data = await fetchApi<UserBookingsResponse>('/api/bookings/me');
    return data.bookings;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[dashboard] bookings fetch failed:', error.status, error.message);
    }
    return [];
  }
}

// ─── Page ───────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const [subscriptions, bookings] = await Promise.all([
    fetchSubscriptions(),
    fetchBookings(),
  ]);

  const currentSub = findCurrentSubscription(subscriptions);
  const upcomingBookings = getUpcomingBookings(bookings);
  const firstName = user.profile?.firstName ?? user.email.split('@')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* ── Welcome ──────────────────────────────────────────── */}
        <section className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-gray-600">
            Ready for your next workout?
          </p>
        </section>

        {/* ── Top Cards: Subscription + Profile ────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Subscription Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
              {currentSub && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusBadge[currentSub.status]?.bg ?? 'bg-gray-100'
                  } ${statusBadge[currentSub.status]?.text ?? 'text-gray-600'}`}
                >
                  {currentSub.status}
                </span>
              )}
            </div>

            {currentSub ? (
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{currentSub.plan.name}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Started: {formatDate(currentSub.startDate)}</p>
                  <p>Expires: {formatDate(currentSub.endDate)}</p>
                </div>
                <Link
                  href="/subscriptions"
                  className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Manage Subscription →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">
                  You don&apos;t have an active subscription.
                </p>
                <Link
                  href="/subscriptions"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Choose a Plan
                </Link>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="text-gray-900 font-medium">
                  {user.profile
                    ? `${user.profile.firstName}${user.profile.lastName ? ` ${user.profile.lastName}` : ''}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 font-medium truncate ml-4">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-gray-900 font-medium">
                  {user.profile ? 'Profile created' : 'Incomplete'}
                </span>
              </div>
            </div>
            <Link
              href="/profile"
              className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {user.profile ? 'View Profile →' : 'Complete Profile →'}
            </Link>
          </div>
        </section>

        {/* ── Upcoming Classes ─────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
            <Link
              href="/classes"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Browse Classes →
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBookings.map((booking) => {
                const colors = categoryColors[booking.liveClass.category] ?? {
                  bg: 'bg-gray-50',
                  text: 'text-gray-700',
                  accent: 'bg-gray-100',
                };
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.accent} ${colors.text}`}
                      >
                        {booking.liveClass.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {booking.liveClass.title}
                    </h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>{formatDateTime(booking.liveClass.startTime)}</p>
                      <p className="text-xs text-gray-400">
                        to {formatDateTime(booking.liveClass.endTime)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-500 mb-4">
                You have no upcoming classes.
              </p>
              <Link
                href="/classes"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Classes
              </Link>
            </div>
          )}
        </section>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/classes"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                Browse Classes
              </span>
            </Link>

            <Link
              href="/subscriptions"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all"
            >
              <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                Subscription
              </span>
            </Link>

            <Link
              href="/diet-plans"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all"
            >
              <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              <span className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                Diet Plans
              </span>
            </Link>

            <Link
              href="/profile"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all"
            >
              <svg className="h-8 w-8 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                Profile
              </span>
            </Link>
          </div>
        </section>

        {/* ── Explore Fitness ──────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Explore Fitness</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/classes?category=YOGA"
              className="relative overflow-hidden rounded-xl bg-emerald-600 p-6 text-white hover:bg-emerald-700 transition-colors group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
              <h3 className="text-xl font-bold mb-1">Yoga</h3>
              <p className="text-emerald-100 text-sm">
                Find balance, flexibility &amp; inner peace
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-emerald-100 group-hover:text-white transition-colors">
                Explore →
              </span>
            </Link>

            <Link
              href="/classes?category=ZUMBA"
              className="relative overflow-hidden rounded-xl bg-pink-600 p-6 text-white hover:bg-pink-700 transition-colors group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
              <h3 className="text-xl font-bold mb-1">Zumba</h3>
              <p className="text-pink-100 text-sm">
                Dance your way to fitness &amp; fun
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-pink-100 group-hover:text-white transition-colors">
                Explore →
              </span>
            </Link>

            <Link
              href="/classes?category=HIIT"
              className="relative overflow-hidden rounded-xl bg-orange-600 p-6 text-white hover:bg-orange-700 transition-colors group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
              <h3 className="text-xl font-bold mb-1">HIIT</h3>
              <p className="text-orange-100 text-sm">
                High-intensity training for maximum results
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-orange-100 group-hover:text-white transition-colors">
                Explore →
              </span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
