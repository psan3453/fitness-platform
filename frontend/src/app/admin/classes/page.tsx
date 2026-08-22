import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { AdminLiveClassesResponse } from '@/lib/types/classes';
import AdminClassesClient from './AdminClassesClient';

async function getClasses() {
  try {
    const data = await fetchApi<AdminLiveClassesResponse>('/api/admin/classes');
    return data.classes;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    console.error('Failed to fetch classes:', error);
    return null;
  }
}

export default async function AdminClassesPage() {
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

  const classes = await getClasses();

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Live Class Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage live Yoga, Zumba, and HIIT classes on the platform.
          </p>
        </div>

        {classes === null ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-medium text-red-600 mb-1">Error Loading Classes</h3>
            <p className="text-gray-500">We encountered a problem loading the live classes data.</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No classes found.</h3>
            <p className="text-gray-500">There are currently no live classes to manage.</p>
          </div>
        ) : (
          <AdminClassesClient initialClasses={classes} />
        )}
      </main>
    </div>
  );
}
