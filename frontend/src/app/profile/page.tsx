import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { ProfileResponse } from '@/lib/types/profile';
import ProfileForm from './components/ProfileForm';

async function fetchProfile(): Promise<ProfileResponse | null> {
  try {
    const data = await fetchApi<ProfileResponse>('/api/users/me/profile');
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[profile] fetch failed:', error.status, error.message);
    }
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }
  const response = await fetchProfile();
  if (!response?.profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-10 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-md w-full">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Unavailable</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t load your profile information. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile
          </h1>
          <p className="text-gray-600">
            Manage your personal information and preferences.
          </p>
        </section>

        {/* ── Profile Layout ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Summary / Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-3xl font-bold mb-4 overflow-hidden border border-gray-200">
                {response.profile.avatarUrl ? (
                  <img src={response.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{response.profile.firstName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {response.profile.firstName} {response.profile.lastName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <div className="mt-6 w-full text-left pt-6 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Role</div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <ProfileForm initialProfile={response.profile} email={user.email} />
          </div>

        </div>
      </main>
    </div>
  );
}
