import Link from 'next/link';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { TrainerProfileResponse, TrainerProfile } from '@/lib/types/trainer';
import { UserSubscriptionsResponse } from '@/lib/types/dashboard';
import PlanSubscribeButton from '@/app/subscriptions/PlanSubscribeButton';

interface TrainerProfilePageProps {
  params: Promise<{ trainerId: string }>;
}

async function fetchTrainerProfile(trainerId: string): Promise<TrainerProfile | null> {
  try {
    const data = await fetchApi<TrainerProfileResponse>(`/api/trainers/${trainerId}`);
    return data.trainer;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    console.error('[trainers/[trainerId]] fetch error:', error);
    return null;
  }
}

async function fetchUserSubscriptions(): Promise<string[]> {
  try {
    const data = await fetchApi<UserSubscriptionsResponse>('/api/subscriptions/me');
    return data.subscriptions
      .filter((s) => s.status === 'ACTIVE' && s.plan.trainerId)
      .map((s) => s.plan.trainerId!);
  } catch {
    return [];
  }
}

const categoryStyles: Record<string, { bg: string; text: string; avatarBg: string; avatarText: string }> = {
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDateTime(iso: string | Date): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return { date, time };
}

export default async function TrainerProfilePage({ params }: TrainerProfilePageProps) {
  const { trainerId } = await params;
  const [trainer, user] = await Promise.all([
    fetchTrainerProfile(trainerId),
    getAuthUser(),
  ]);

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 8.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trainer Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">
            The trainer you are looking for does not exist or is currently inactive.
          </p>
          <Link
            href="/trainers"
            className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
          >
            &larr; Back to All Trainers
          </Link>
        </div>
      </div>
    );
  }

  // If user is logged in, check if they are already subscribed to this trainer
  const activeSubscribedTrainerIds = user ? await fetchUserSubscriptions() : [];
  const isSubscribedToTrainer = activeSubscribedTrainerIds.includes(trainer.id);

  const style = categoryStyles[trainer.specialization] || {
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-700',
    avatarBg: 'bg-gray-100',
    avatarText: 'text-gray-800',
  };
  const initials = getInitials(trainer.name);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ── Breadcrumb / Back Link ────────────────────────── */}
        <div>
          <Link
            href="/trainers"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            &larr; Back to Trainers
          </Link>
        </div>

        {/* ── Trainer Profile Header Card ───────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {trainer.profileImageUrl ? (
              <img
                src={trainer.profileImageUrl}
                alt={trainer.name}
                className="w-24 h-24 sm:w-28 sm:end-28 rounded-full object-cover border-4 border-gray-50 shadow-md"
              />
            ) : (
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center font-extrabold text-3xl sm:text-4xl border-4 border-white shadow-md ${style.avatarBg} ${style.avatarText}`}
              >
                {initials}
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{trainer.name}</h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${style.bg} ${style.text}`}
                >
                  {trainer.specialization}
                </span>
                {isSubscribedToTrainer && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active Subscriber
                  </span>
                )}
              </div>

              {trainer.experience && (
                <p className="text-sm font-medium text-gray-500">
                  <span className="text-gray-900 font-semibold">{trainer.experience}</span> of coaching experience
                </p>
              )}

              {trainer.certifications && (
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Certifications:</span> {trainer.certifications}
                </p>
              )}

              {trainer.bio && (
                <p className="text-sm sm:text-base text-gray-600 pt-2 max-w-3xl leading-relaxed">
                  {trainer.bio}
                </p>
              )}

              {/* Diet Plan Availability Badge (Non-sensitive metadata) */}
              {trainer.offersDietPlans && (
                <div className="pt-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-green-50 text-green-800 border border-green-200">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <span>Offers customized diet & nutrition plans for subscribers ({trainer.dietPlansCount} {trainer.dietPlansCount === 1 ? 'plan' : 'plans'} available)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Subscription Plans Section ────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
            <p className="text-sm text-gray-600 mt-1">
              Subscribe to unlock all live classes and training guidance hosted by {trainer.name}.
            </p>
          </div>

          {trainer.plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainer.plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-extrabold text-gray-900">{formatPrice(plan.price)}</span>
                      <span className="text-gray-500 text-sm ml-1">/ {plan.durationDays} days</span>
                    </div>

                    {plan.description && (
                      <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                    )}

                    <ul className="space-y-2.5 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-50">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-emerald-500 mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Access to live sessions by {trainer.name}
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-emerald-500 mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {trainer.specialization} specialized training
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 text-emerald-500 mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {plan.durationDays}-day membership pass
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    {!user ? (
                      <Link
                        href={`/login?redirect=/trainers/${trainer.id}`}
                        className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
                      >
                        Login to Subscribe
                      </Link>
                    ) : isSubscribedToTrainer ? (
                      <button
                        disabled
                        className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 cursor-not-allowed"
                      >
                        ✓ Already Subscribed
                      </button>
                    ) : (
                      <PlanSubscribeButton
                        planId={plan.id}
                        planName={plan.name}
                        userEmail={user.email}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <h3 className="text-base font-bold text-gray-900">No subscription plans currently available.</h3>
              <p className="text-sm text-gray-500 mt-1">This trainer has not published any active subscription plans yet.</p>
            </div>
          )}
        </section>

        {/* ── Upcoming Classes Section ──────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Live Classes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Interactive sessions scheduled by {trainer.name}. Active subscribers can join when the session begins.
            </p>
          </div>

          {trainer.upcomingClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainer.upcomingClasses.map((cls) => {
                const { date, time: startTime } = formatDateTime(cls.startTime);
                const { time: endTime } = formatDateTime(cls.endTime);

                return (
                  <div
                    key={cls.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${style.bg} ${style.text}`}
                        >
                          {cls.category}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {cls.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{cls.title}</h3>
                      {cls.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cls.description}</p>
                      )}

                      <div className="space-y-2 text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          <span>{date} • {startTime} - {endTime}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                          <span>Capacity: {cls.capacity} participants</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      {isSubscribedToTrainer ? (
                        <Link
                          href="/classes"
                          className="w-full flex justify-center items-center py-2 px-4 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                        >
                          View in Class Schedule
                        </Link>
                      ) : (
                        <p className="text-xs text-center text-gray-500">
                          Subscribe to this trainer to join
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <h3 className="text-base font-bold text-gray-900">No upcoming classes scheduled.</h3>
              <p className="text-sm text-gray-500 mt-1">This trainer has no upcoming live sessions on the schedule.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
