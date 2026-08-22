import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { AdminTrainerApplicationsResponse } from '@/lib/types/admin';
import TrainerApplicationsClient from './TrainerApplicationsClient';

async function getApplications() {
  try {
    const data = await fetchApi<AdminTrainerApplicationsResponse>('/api/admin/trainer-applications');
    return data.applications;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    console.error('Failed to fetch trainer applications:', error);
    return null;
  }
}

export default async function AdminTrainerApplicationsPage() {
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

  const applications = await getApplications();

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Trainer Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Review and manage incoming trainer applications.
          </p>
        </div>

        {applications === null ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-medium text-red-600 mb-1">Error Loading Applications</h3>
            <p className="text-gray-500">We encountered a problem loading the applications data.</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No trainer applications found.</h3>
            <p className="text-gray-500">There are currently no trainer applications to review.</p>
          </div>
        ) : (
          <TrainerApplicationsClient initialApplications={applications} />
        )}
      </main>
    </div>
  );
}
