import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { LiveClassesResponse } from '@/lib/types/classes';
import { UserBookingsResponse } from '@/lib/types/dashboard';
import ClassCard from './components/ClassCard';

interface ClassesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function fetchClasses(category?: string) {
  try {
    const url = category ? `/api/classes?category=${category}` : '/api/classes';
    const data = await fetchApi<LiveClassesResponse>(url);
    return data.classes;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[classes] fetch failed:', error.status, error.message);
    }
    return [];
  }
}

async function fetchMyBookings() {
  try {
    const data = await fetchApi<UserBookingsResponse>('/api/bookings/me');
    return data.bookings;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[classes] bookings fetch failed:', error.status, error.message);
    }
    return [];
  }
}

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const categoryParam = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const [classes, bookings] = await Promise.all([
    fetchClasses(categoryParam),
    fetchMyBookings(),
  ]);

  const bookedClassIds = new Set(
    bookings
      .filter((b) => b.status === 'BOOKED' || b.status === 'ATTENDED')
      .map((b) => b.liveClassId)
  );

  const categories = [
    { name: 'All', value: undefined },
    { name: 'Yoga', value: 'YOGA' },
    { name: 'Zumba', value: 'ZUMBA' },
    { name: 'HIIT', value: 'HIIT' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* ── Header ──────────────────────────────────────────── */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Classes
          </h1>
          <p className="text-gray-600">
            Browse and book upcoming live Yoga, Zumba, and HIIT sessions.
          </p>
        </section>

        {/* ── Category Filter ─────────────────────────────────── */}
        <section className="mb-8 flex space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const isActive = categoryParam === cat.value || (!categoryParam && !cat.value);
            const href = cat.value ? `/classes?category=${cat.value}` : '/classes';
            return (
              <Link
                key={cat.name}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </section>

        {/* ── Class List ──────────────────────────────────────── */}
        <section>
          {classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((liveClass) => (
                <ClassCard
                  key={liveClass.id}
                  liveClass={liveClass}
                  isBooked={bookedClassIds.has(liveClass.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No upcoming classes found
              </h3>
              <p className="text-gray-500 mb-6">
                {categoryParam
                  ? `There are currently no upcoming ${categoryParam} classes scheduled.`
                  : 'Check back later for new live classes.'}
              </p>
              {categoryParam && (
                <Link
                  href="/classes"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View All Classes
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
