import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { DietPlansResponse } from '@/lib/types/diet-plan';
import DietPlansClient from './DietPlansClient';

async function getDietPlans() {
  try {
    const res = await fetchApi<DietPlansResponse>('/api/diet-plans/mine');
    return { plans: res.dietPlans, error: null };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return { plans: null, error: 'Access Denied' };
    }
    console.error('Failed to fetch admin diet plans:', error);
    return { plans: null, error: 'An error occurred loading the data.' };
  }
}

export default async function AdminDietPlansPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You need administrator privileges to access this area.
            </p>
            <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { plans, error } = await getDietPlans();

  if (error || plans === null) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-red-600 mb-6">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Diet Plan Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and edit dietary plans across the platform.
          </p>
        </div>

        <DietPlansClient initialPlans={plans} />
      </main>
    </div>
  );
}
