import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Fitness Platform
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Hello, {user.profile?.firstName || user.email}! You are successfully logged in.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/classes" className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors">
                <h3 className="font-bold text-blue-600 mb-1">Live Classes</h3>
                <p className="text-sm text-gray-600">Join expert-led sessions</p>
              </Link>
              <Link href="/diet-plans" className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors">
                <h3 className="font-bold text-green-600 mb-1">Diet Plans</h3>
                <p className="text-sm text-gray-600">View personalized nutrition</p>
              </Link>
              <Link href="/subscriptions" className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-purple-50 transition-colors">
                <h3 className="font-bold text-purple-600 mb-1">Subscription</h3>
                <p className="text-sm text-gray-600">Manage your membership</p>
              </Link>
              <Link href="/profile" className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-orange-50 transition-colors">
                <h3 className="font-bold text-orange-600 mb-1">Profile</h3>
                <p className="text-sm text-gray-600">Update your details</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
