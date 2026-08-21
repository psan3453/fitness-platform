import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { DietPlansResponse, DietPlan } from '@/lib/types/diet-plan';

interface DietPlansPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function fetchDietPlans(): Promise<DietPlan[]> {
  try {
    const data = await fetchApi<DietPlansResponse>('/api/diet-plans');
    return data.dietPlans;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[diet-plans] fetch failed:', error.status, error.message);
    }
    return [];
  }
}

const GOALS = [
  { name: 'All', value: undefined },
  { name: 'Weight Loss', value: 'WEIGHT_LOSS' },
  { name: 'Weight Gain', value: 'WEIGHT_GAIN' },
  { name: 'Muscle Gain', value: 'MUSCLE_GAIN' },
  { name: 'General Fitness', value: 'GENERAL_FITNESS' },
];

export default async function DietPlansPage({ searchParams }: DietPlansPageProps) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const goalParam = typeof resolvedParams.goal === 'string' ? resolvedParams.goal : undefined;
  const allPlans = await fetchDietPlans();
  const filteredPlans = goalParam
    ? allPlans.filter((plan) => plan.goal === goalParam)
    : allPlans;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diet Plans
          </h1>
          <p className="text-gray-600">
            Explore structured nutrition plans designed to help you reach your goals.
          </p>
        </section>

        {/* ── Category Filter ─────────────────────────────────── */}
        <section className="mb-10 flex space-x-2 overflow-x-auto pb-2">
          {GOALS.map((goal) => {
            const isActive = goalParam === goal.value || (!goalParam && !goal.value);
            const href = goal.value ? `/diet-plans?goal=${goal.value}` : '/diet-plans';
            return (
              <Link
                key={goal.name}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {goal.name}
              </Link>
            );
          })}
        </section>

        {/* ── Plans Grid ──────────────────────────────────────── */}
        <section>
          {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                  {/* Plan Header */}
                  <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 tracking-wide">
                        {plan.goal.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h2>
                    {plan.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {plan.description}
                      </p>
                    )}
                  </div>
                  {/* Plan Items / Meals */}
                  <div className="p-6 flex-1 flex flex-col gap-6">
                    {plan.items.length > 0 ? (
                      plan.items.map((item) => (
                        <div key={item.id} className="border-l-2 border-blue-200 pl-4">
                          <div className="flex items-baseline justify-between mb-1">
                            <h4 className="text-sm font-bold text-gray-900">{item.mealType}</h4>
                            {item.quantity && (
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-800 mb-1">{item.mealName}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No meals configured for this plan.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No diet plans available
              </h3>
              <p className="text-gray-500 mb-6">
                {goalParam
                  ? `There are currently no active diet plans for ${goalParam.replace('_', ' ')}.`
                  : 'Check back later for new structured nutrition plans.'}
              </p>
              {goalParam&&(
                <Link
                  href="/diet-plans"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View All Diet Plans
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
