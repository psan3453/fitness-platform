import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { UserSubscriptionsResponse, UserSubscription } from '@/lib/types/dashboard';
import { TrainerProfileResponse, TrainerProfile } from '@/lib/types/trainer';

// ── Types ────────────────────────────────────────────────────────────

interface SubscribedTrainerCardData {
  trainer: TrainerProfile;
  subscriptions: UserSubscription[];
}

// ── Data Fetching ────────────────────────────────────────────────────

async function fetchUserSubscriptions(): Promise<UserSubscription[]> {
  try {
    const data = await fetchApi<UserSubscriptionsResponse>('/api/subscriptions/me');
    return data.subscriptions;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[my-trainers] subscriptions fetch failed:', error.status, error.message);
    } else {
      console.error('[my-trainers] unexpected subscriptions fetch error:', error);
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
    console.error(`[my-trainers] fetch trainer profile (${trainerId}) failed:`, error);
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

const categoryBadgeStyles: Record<string, { bg: string; text: string; avatarBg: string; avatarText: string }> = {
  YOGA: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', avatarBg: 'bg-emerald-100', avatarText: 'text-emerald-800' },
  ZUMBA: { bg: 'bg-pink-50 border-pink-200', text: 'text-pink-700', avatarBg: 'bg-pink-100', avatarText: 'text-pink-800' },
  HIIT: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', avatarBg: 'bg-orange-100', avatarText: 'text-orange-800' },
};

function getInitials(name: string): string {
  if (!name || !name.trim()) return 'TR';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Page Component ───────────────────────────────────────────────────

export default async function MyTrainersPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login?redirect=/my-trainers');
  }

  const subscriptions = await fetchUserSubscriptions();
  const now = new Date();

  // 1. Filter only active, non-expired subscriptions with a valid trainerId
  const activeSubsWithTrainer = subscriptions.filter(
    (s) => s.status === 'ACTIVE' && new Date(s.endDate) > now && Boolean(s.plan?.trainerId)
  );

  // 2. Group subscriptions by trainerId to eliminate duplicate cards
  const trainerSubsMap = new Map<string, UserSubscription[]>();
  for (const sub of activeSubsWithTrainer) {
    const tId = sub.plan.trainerId!;
    const list = trainerSubsMap.get(tId) || [];
    list.push(sub);
    trainerSubsMap.set(tId, list);
  }

  // 3. Fetch full public trainer profile for each distinct subscribed trainer
  const distinctTrainerIds = Array.from(trainerSubsMap.keys());
  const trainerProfiles = await Promise.all(
    distinctTrainerIds.map((id) => fetchTrainerProfile(id))
  );

  // 4. Combine into display cards (skipping any trainer not returned / inactive)
  const myTrainers: SubscribedTrainerCardData[] = [];
  distinctTrainerIds.forEach((tId, idx) => {
    const profile = trainerProfiles[idx];
    if (profile) {
      myTrainers.push({
        trainer: profile,
        subscriptions: trainerSubsMap.get(tId) || [],
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ────────────────────────────────────────── */}
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              My Trainers
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage your active coaching relationships, view schedules, and access training plans.
            </p>
          </div>

          {/* Quick Hub Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/trainers"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Find More Trainers
            </Link>
            <Link
              href="/subscriptions"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              All Plans
            </Link>
            <Link
              href="/classes"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Classes
            </Link>
            <Link
              href="/diet-plans"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Diet Plans
            </Link>
          </div>
        </section>

        {/* ── Subscribed Trainers Grid ──────────────────────── */}
        <section>
          {myTrainers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTrainers.map(({ trainer, subscriptions: subs }) => {
                const badge = categoryBadgeStyles[trainer.specialization] || {
                  bg: 'bg-gray-50 border-gray-200',
                  text: 'text-gray-700',
                  avatarBg: 'bg-gray-100',
                  avatarText: 'text-gray-800',
                };
                const initials = getInitials(trainer.name);

                return (
                  <div
                    key={trainer.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Top Header: Avatar + Category */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          {trainer.profileImageUrl ? (
                            <img
                              src={trainer.profileImageUrl}
                              alt={trainer.name}
                              className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                            />
                          ) : (
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-base border-2 border-white shadow-sm ${badge.avatarBg} ${badge.avatarText}`}
                            >
                              {initials}
                            </div>
                          )}
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{trainer.name}</h2>
                            {trainer.experience && (
                              <p className="text-xs font-medium text-gray-500 mt-0.5">
                                {trainer.experience} experience
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${badge.bg} ${badge.text}`}
                        >
                          {trainer.specialization}
                        </span>
                      </div>

                      {/* Bio */}
                      {trainer.bio ? (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{trainer.bio}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic mb-4">Certified fitness coach.</p>
                      )}

                      {/* Active Membership Details */}
                      <div className="mb-4 bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-emerald-900 uppercase tracking-wide">
                            Active Membership
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ACTIVE
                          </span>
                        </div>
                        <div className="space-y-0.5 text-emerald-800">
                          {subs.map((s) => (
                            <div key={s.id} className="flex justify-between items-center">
                              <span className="font-medium truncate mr-2">{s.plan.name}</span>
                              <span className="text-emerald-700 whitespace-nowrap">
                                Valid until {formatDate(s.endDate)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metadata Chips: Upcoming classes & Diet plans */}
                      <div className="mt-auto pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-gray-500">Upcoming Classes</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {trainer.upcomingClasses.length}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-gray-500">Diet Plans</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {trainer.dietPlansCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
                      <Link
                        href={`/trainers/${trainer.id}`}
                        className="flex justify-center items-center py-2 px-3 rounded-xl text-xs font-semibold text-blue-600 bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm"
                      >
                        Profile &rarr;
                      </Link>
                      <Link
                        href="/classes"
                        className="flex justify-center items-center py-2 px-3 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        Live Schedule
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No active trainers yet</h2>
              <p className="text-gray-500 text-sm mb-6">
                You do not have any active trainer subscriptions. Browse our certified trainers or explore subscription plans to start your guided fitness journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/trainers"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  Find Trainers
                </Link>
                <Link
                  href="/subscriptions"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
                >
                  Explore Plans
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
