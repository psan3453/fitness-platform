import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { SubscriptionPlansResponse, AdminSubscriptionsResponse } from '@/lib/types/subscription';
import SubscriptionPlansClient from './SubscriptionPlansClient';

async function getData() {
  try {
    const [plansRes, subsRes] = await Promise.all([
      fetchApi<SubscriptionPlansResponse>('/api/admin/subscription-plans'),
      fetchApi<AdminSubscriptionsResponse>('/api/admin/subscriptions'),
    ]);
    return { plans: plansRes.plans, subscriptions: subsRes.subscriptions, error: null };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return { plans: null, subscriptions: null, error: 'Access Denied' };
    }
    console.error('Failed to fetch admin subscriptions data:', error);
    return { plans: null, subscriptions: null, error: 'An error occurred loading the data.' };
  }
}

export default async function AdminSubscriptionsPage() {
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

  const { plans, subscriptions, error } = await getData();

  if (error || plans === null || subscriptions === null) {
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
            Subscription Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage platform subscription plans and view user subscriptions.
          </p>
        </div>

        <div className="space-y-12">
          {/* Part A: Plans */}
          <section>
            <SubscriptionPlansClient initialPlans={plans} />
          </section>

          <hr className="border-gray-200" />

          {/* Part B: Subscriptions */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Subscriptions</h2>
              <p className="text-sm text-gray-500 mt-1">Viewing all subscriptions across the platform.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub) => {
                      const userName = sub.user.profile
                        ? `${sub.user.profile.firstName} ${sub.user.profile.lastName || ''}`.trim()
                        : 'No Profile';
                      const start = new Date(sub.startDate).toLocaleDateString('en-US');
                      const end = new Date(sub.endDate).toLocaleDateString('en-US');

                      return (
                        <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{userName}</div>
                            <div className="text-xs text-gray-500">{sub.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{sub.plan.name}</div>
                            <div className="text-xs text-gray-500">₹{sub.plan.price} / {sub.plan.durationDays}d</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              sub.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              sub.status === 'EXPIRED' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-500">
                              <span className="font-medium text-gray-700">Start:</span> {start}
                            </div>
                            <div className="text-xs text-gray-500">
                              <span className="font-medium text-gray-700">End:</span> {end}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {subscriptions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                          No subscriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
