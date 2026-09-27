import Link from 'next/link';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { TrainersResponse, TrainerSummary } from '@/lib/types/trainer';

interface TrainersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function fetchTrainers(search?: string, specialization?: string): Promise<TrainerSummary[]> {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) params.set('search', search.trim());
    if (specialization && specialization !== 'ALL') params.set('specialization', specialization);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchApi<TrainersResponse>(`/api/trainers${qs}`);
    return data.trainers;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[trainers] fetch failed:', error.status, error.message);
    } else {
      console.error('[trainers] unexpected error:', error);
    }
    return [];
  }
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Yoga', value: 'YOGA' },
  { label: 'Zumba', value: 'ZUMBA' },
  { label: 'HIIT', value: 'HIIT' },
];

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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function TrainersPage({ searchParams }: TrainersPageProps) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const specialization =
    typeof resolvedParams.specialization === 'string' ? resolvedParams.specialization.toUpperCase() : 'ALL';

  const trainers = await fetchTrainers(search, specialization);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ────────────────────────────────────────── */}
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Find Trainers
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover certified trainers, explore their live classes, and subscribe for personalized coaching.
            </p>
          </div>
          <div>
            <Link
              href="/trainers/apply"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-blue-600 text-blue-600 bg-white text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Become a Trainer
            </Link>
          </div>
        </section>

        {/* ── Search and Filter Controls ─────────────────────── */}
        <section className="mb-10 space-y-4">
          {/* Search form */}
          <form method="GET" action="/trainers" className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                name="search"
                defaultValue={search || ''}
                placeholder="Search trainers by name or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            {specialization && specialization !== 'ALL' && (
              <input type="hidden" name="specialization" value={specialization} />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Search
            </button>
            {search && (
              <Link
                href={specialization && specialization !== 'ALL' ? `/trainers?specialization=${specialization}` : '/trainers'}
                className="px-4 py-2.5 border border-gray-200 bg-white text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Clear
              </Link>
            )}
          </form>

          {/* Category Filter Pills */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => {
              const isActive = specialization === cat.value;
              const params = new URLSearchParams();
              if (search) params.set('search', search);
              if (cat.value !== 'ALL') params.set('specialization', cat.value);
              const href = params.toString() ? `/trainers?${params.toString()}` : '/trainers';

              return (
                <Link
                  key={cat.value}
                  href={href}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Trainer Grid ───────────────────────────────────── */}
        <section>
          {trainers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer) => {
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
                        <p className="text-sm text-gray-600 line-clamp-3 mb-6">{trainer.bio}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic mb-6">Certified fitness professional ready to coach you.</p>
                      )}

                      {/* Metadata Chips / Stats */}
                      <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-gray-500">Upcoming Classes</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {trainer.upcomingClassesCount}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-gray-500">Pricing</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {trainer.startingPrice ? `From ${formatPrice(trainer.startingPrice)}` : 'Plans Available'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Link */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <Link
                        href={`/trainers/${trainer.id}`}
                        className="w-full flex justify-center items-center py-2 px-4 rounded-xl text-sm font-semibold text-blue-600 bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm"
                      >
                        View Profile &rarr;
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">No trainers found</h3>
              <p className="text-gray-500 text-sm mb-6">
                {search || specialization !== 'ALL'
                  ? 'No trainers matched your search criteria. Try removing filters or searching with different keywords.'
                  : 'There are currently no active trainers available. Please check back soon.'}
              </p>
              {(search || specialization !== 'ALL') && (
                <Link
                  href="/trainers"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  View All Trainers
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
