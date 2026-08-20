import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { TrainerApplicationsResponse, TrainerApplication } from '@/lib/types/trainer';
import TrainerApplicationForm from './components/TrainerApplicationForm';

async function fetchMyApplications(): Promise<TrainerApplication[]> {
  try {
    const response = await fetchApi<TrainerApplicationsResponse>('/api/trainer-applications/me');
    return response.applications;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[trainers] failed to fetch applications:', error.status, error.message);
    }
    return [];
  }
}

export default async function TrainersPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const applications = await fetchMyApplications();
  
  // Find if there is an active application to determine state.
  // We care about PENDING or APPROVED. If only REJECTED exists, they can reapply.
  const activeApplication = applications.find(
    (app) => app.status === 'PENDING' || app.status === 'APPROVED'
  );

  const mostRecentRejected = applications.find((app) => app.status === 'REJECTED');
  const canApply = !activeApplication;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* State 2: PENDING */}
        {activeApplication?.status === 'PENDING' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-100 p-6 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Application Under Review</h1>
                <p className="text-gray-600">
                  Your trainer application has been submitted and is waiting for admin review.
                </p>
              </div>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700 tracking-wide">
                PENDING
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Application Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-gray-500 mb-1">Specialization</dt>
                  <dd className="font-medium text-gray-900">{activeApplication.specialization}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">Submitted On</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(activeApplication.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 mb-1">Bio</dt>
                  <dd className="text-gray-900">{activeApplication.bio || 'Not provided'}</dd>
                </div>
              </dl>
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
                  &larr; Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* State 2: APPROVED */}
        {activeApplication?.status === 'APPROVED' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">You&apos;re a Trainer!</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
              Your application has been approved. You can now access trainer functionality, create live classes, and manage your sessions.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* State 1: Application Form (No active application) */}
        {canApply && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Header / Info Column */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                Become a Trainer
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Share your expertise and help people train, move and transform.
              </p>
              
              {mostRecentRejected && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-bold text-red-800 mb-1 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Previous Application Rejected
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    Your previous application was not approved. You can submit a new application below.
                  </p>
                  {mostRecentRejected.rejectionReason && (
                    <div className="text-sm bg-white/60 p-3 rounded text-red-800">
                      <strong>Reason:</strong> {mostRecentRejected.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">As a trainer, you can:</h3>
                <ul className="space-y-3">
                  <li className="flex text-gray-600">
                    <svg className="h-5 w-5 text-emerald-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Host live fitness classes
                  </li>
                  <li className="flex text-gray-600">
                    <svg className="h-5 w-5 text-emerald-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Teach Yoga, Zumba or HIIT
                  </li>
                  <li className="flex text-gray-600">
                    <svg className="h-5 w-5 text-emerald-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Build your trainer profile
                  </li>
                  <li className="flex text-gray-600">
                    <svg className="h-5 w-5 text-emerald-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Help users reach their fitness goals
                  </li>
                </ul>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <TrainerApplicationForm />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
