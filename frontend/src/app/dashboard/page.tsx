import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import type {
  UserSubscriptionsResponse,
  UserSubscription,
} from '@/lib/types/dashboard';
import type { LiveClassesResponse, LiveClass } from '@/lib/types/classes';
import type { TrainerProfileResponse, TrainerProfile } from '@/lib/types/trainer';
import ClassCard from '@/app/classes/components/ClassCard';

// ─── Helpers ────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  if (!name || !name.trim()) return 'TR';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const categoryStyles: Record<string, { bg: string; text: string; badge: string; avatarBg: string; avatarText: string }> = {
  YOGA: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', avatarBg: 'bg-emerald-100', avatarText: 'text-emerald-800' },
  ZUMBA: { bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-800', avatarBg: 'bg-pink-100', avatarText: 'text-pink-800' },
  HIIT: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800', avatarBg: 'bg-orange-100', avatarText: 'text-orange-800' },
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

async function fetchClasses(): Promise<LiveClass[]> {
  try {
    const data = await fetchApi<LiveClassesResponse>('/api/classes');
    return data.classes;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[dashboard] classes fetch failed:', error.status, error.message);
    }
    return [];
  }
}

async function fetchTrainerProfile(trainerId: string): Promise<TrainerProfile | null> {
  try {
    const data = await fetchApi<TrainerProfileResponse>(`/api/trainers/${trainerId}`);
    return data.trainer;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error(`[dashboard] fetch trainer profile (${trainerId}) failed:`, error);
    return null;
  }
}

// ─── Page ───────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const [subscriptions, classes] = await Promise.all([
    fetchSubscriptions(),
    fetchClasses(),
  ]);

  const now = new Date();

  // 1. Filter valid active trainer-specific subscriptions
  const activeTrainerSubs = subscriptions.filter((s) => {
    if (s.status !== 'ACTIVE') return false;
    if (!s.plan || !s.plan.trainerId) return false;
    const end = new Date(s.endDate);
    if (isNaN(end.getTime()) || end <= now) return false;
    return true;
  });

  // 2. Fetch trainer profiles for each distinct trainer ID in active subscriptions
  const distinctTrainerIds = Array.from(
    new Set(activeTrainerSubs.map((s) => s.plan.trainerId as string))
  );

  const trainerProfiles = await Promise.all(
    distinctTrainerIds.map((id) => fetchTrainerProfile(id))
  );

  const trainerProfileMap = new Map<string, TrainerProfile>();
  trainerProfiles.forEach((tp) => {
    if (tp) {
      trainerProfileMap.set(tp.id, tp);
    }
  });

  // 3. Filter upcoming classes strictly from subscribed trainers
  const subscribedTrainerIdSet = new Set(distinctTrainerIds);
  const upcomingClasses = classes
    .filter((c) => {
      if (!subscribedTrainerIdSet.has(c.trainerId)) return false;
      if (c.status === 'CANCELLED') return false;
      const end = new Date(c.endTime);
      return !isNaN(end.getTime()) && end > now;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 6);

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

        {/* ── Top Section: Active Subscriptions & Profile ─────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Subscriptions Column (spans 2 cols on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
                <p className="text-xs text-gray-500">
                  {activeTrainerSubs.length > 0
                    ? `${activeTrainerSubs.length} active trainer membership${activeTrainerSubs.length > 1 ? 's' : ''}`
                    : 'Trainer-specific memberships'}
                </p>
              </div>
              <div className="flex space-x-3 text-sm">
                <Link
                  href="/my-trainers"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  My Trainers →
                </Link>
                <Link
                  href="/subscriptions"
                  className="font-medium text-gray-500 hover:text-gray-700"
                >
                  Browse Plans →
                </Link>
              </div>
            </div>

            {activeTrainerSubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeTrainerSubs.map((sub) => {
                  const trainerId = sub.plan.trainerId as string;
                  const trainer = trainerProfileMap.get(trainerId);
                  const trainerName = trainer?.name || 'Trainer';
                  const specialization = trainer?.specialization || 'TRAINER';
                  const styles = categoryStyles[specialization] ?? {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    badge: 'bg-blue-100 text-blue-800',
                    avatarBg: 'bg-blue-100',
                    avatarText: 'text-blue-800',
                  };

                  return (
                    <div
                      key={sub.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        {/* Header: Trainer avatar & info */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            {trainer?.profileImageUrl ? (
                              <img
                                src={trainer.profileImageUrl}
                                alt={trainerName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${styles.avatarBg} ${styles.avatarText}`}
                              >
                                {getInitials(trainerName)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link
                                href={`/trainers/${trainerId}`}
                                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block"
                              >
                                {trainerName}
                              </Link>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium mt-0.5 ${styles.badge}`}
                              >
                                {specialization}
                              </span>
                            </div>
                          </div>

                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shrink-0">
                            ACTIVE
                          </span>
                        </div>

                        {/* Plan details */}
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
                          <p className="font-medium text-gray-900">{sub.plan.name}</p>
                          <p className="text-xs text-gray-500">
                            Expires: <span className="text-gray-700 font-medium">{formatDate(sub.endDate)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <Link
                          href={`/trainers/${trainerId}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          View Profile →
                        </Link>
                        <Link
                          href="/classes"
                          className="font-medium text-gray-500 hover:text-gray-700"
                        >
                          Classes →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  No active trainer subscriptions
                </h3>
                <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
                  Subscribe to verified trainers to unlock their live interactive classes and personalized diet plans.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/trainers"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Find Trainers
                  </Link>
                  <Link
                    href="/subscriptions"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Browse Plans
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Card Column */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Name</span>
                    <span className="text-gray-900 font-medium">
                      {user.profile
                        ? `${user.profile.firstName}${user.profile.lastName ? ` ${user.profile.lastName}` : ''}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-900 font-medium truncate ml-4 max-w-[180px]">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Role</span>
                    <span className="text-gray-900 font-medium capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Status</span>
                    <span className="text-gray-900 font-medium">
                      {user.profile ? 'Profile complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href="/profile"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {user.profile ? 'View Profile →' : 'Complete Profile →'}
                </Link>
                <Link
                  href="/my-trainers"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  My Trainers →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Upcoming Classes from Subscribed Trainers ─────────── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
              <p className="text-xs text-gray-500">
                Scheduled sessions from your subscribed trainers
              </p>
            </div>
            <Link
              href="/classes"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Browse All Classes →
            </Link>
          </div>

          {upcomingClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingClasses.map((liveClass) => (
                <ClassCard
                  key={liveClass.id}
                  liveClass={liveClass}
                  isSubscribed={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {activeTrainerSubs.length > 0
                  ? 'No upcoming classes scheduled yet'
                  : 'Subscribe to trainers to see upcoming classes'}
              </h3>
              <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
                {activeTrainerSubs.length > 0
                  ? 'Your subscribed trainers currently have no scheduled live classes. Check back soon or explore classes across all trainers.'
                  : 'Subscribe to a trainer to see their scheduled live classes and join sessions directly from your dashboard.'}
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/classes"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Classes
                </Link>
                {activeTrainerSubs.length === 0 && (
                  <Link
                    href="/trainers"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Find Trainers
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link
              href="/trainers"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Find Trainers
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Explore Directory
              </span>
            </Link>

            <Link
              href="/my-trainers"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                My Trainers
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Active Coaches
              </span>
            </Link>

            <Link
              href="/classes"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                Live Classes
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Join Sessions
              </span>
            </Link>

            <Link
              href="/subscriptions"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                Plans
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Subscription Catalog
              </span>
            </Link>

            <Link
              href="/diet-plans"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                Diet Plans
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Nutrition Guides
              </span>
            </Link>

            <Link
              href="/profile"
              className="group flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Profile
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5">
                Account Settings
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
