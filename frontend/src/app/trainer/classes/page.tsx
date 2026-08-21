import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import { fetchApi, ApiError } from '@/lib/api/fetcher';
import { TrainerClassesResponse } from '@/lib/types/classes';

async function getTrainerClasses() {
  try {
    const data = await fetchApi<TrainerClassesResponse>('/api/trainer/classes');
    return data.classes;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    console.error('Failed to fetch trainer classes:', error);
    return null;
  }
}

export default async function TrainerClassesPage() {
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

  const classes = await getTrainerClasses();

  if (classes === null) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Classes</h1>
            <p className="text-gray-600 mb-6">
              We encountered a problem loading your classes.
            </p>
            <Link href="/trainer/dashboard" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="mb-2">
              <Link href="/trainer/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and edit your created classes.
            </p>
          </div>
          <Link
            href="/trainer/classes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Class
          </Link>
        </div>

        {classes.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {classes.map((cls) => (
                <li key={cls.id}>
                  <Link href={`/trainer/classes/${cls.id}`} className="block hover:bg-gray-50 transition-colors">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">{cls.title}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            cls.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                            cls.status === 'LIVE' ? 'bg-red-100 text-red-800' :
                            cls.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cls.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mr-2">
                              {cls.category}
                            </span>
                            Cap: {cls.capacity}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <p>
                            <time dateTime={cls.startTime}>
                              {new Date(cls.startTime).toLocaleDateString()} {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </time>
                            {' - '}
                            <time dateTime={cls.endTime}>
                              {new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </time>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No classes</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new live class.</p>
            <div className="mt-6">
              <Link
                href="/trainer/classes/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Class
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
