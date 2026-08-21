import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { ProfileResponse } from '@/lib/types/profile';
import Link from 'next/link';

async function getTrainerProfile() {
  try {
    const data = await fetchApi<ProfileResponse>('/api/users/me/profile');
    return data.profile;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    console.error('Failed to fetch profile:', error);
    return null;
  }
}

export default async function TrainerProfilePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'TRAINER') {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You need trainer privileges to access this area.
            </p>
            <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const profile = await getTrainerProfile();

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h1>
            <p className="text-gray-600 mb-6">
              We encountered a problem loading your profile data.
            </p>
            <Link href="/trainer/dashboard" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Return to Trainer Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/trainer/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Trainer Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Your trainer profile information. Profile updates are currently managed by administrators.
            </p>
          </div>

          <div className="px-6 py-6 space-y-8">
            {/* General Info */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">General Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">First Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.firstName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.lastName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.phone || 'Not provided'}</dd>
                </div>
              </dl>
            </div>

            {/* Trainer Specific Info - placeholders for now as backend lacks direct trainer profile fetch */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Trainer Details</h2>
              <div className="rounded-md bg-blue-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Additional trainer details such as specialization and certifications are managed internally.
                      Update functionality will be available in a future release.
                    </p>
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{profile.bio || 'No bio provided'}</dd>
                </div>
                {/* These are structural placeholders since backend doesn't return them for the current user in /api/users/me/profile */}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                  <dd className="mt-1 text-sm text-gray-900 italic text-gray-400">On file with administration</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Experience</dt>
                  <dd className="mt-1 text-sm text-gray-900 italic text-gray-400">On file with administration</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Certifications</dt>
                  <dd className="mt-1 text-sm text-gray-900 italic text-gray-400">On file with administration</dd>
                </div>
              </dl>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
