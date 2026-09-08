import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/session';

const adminSections = [
  {
    title: 'Trainer Applications',
    description: 'Review, approve, or reject trainer applications.',
    href: '/admin/trainer-applications',
    available: true,
  },
  {
    title: 'User Management',
    description: 'Manage platform users and account status.',
    href: '/admin/users',
    available: true,
  },
  {
    title: 'Trainer Management',
    description: 'Manage approved trainers and their profiles.',
    href: '#',
    available: false,
  },
  {
    title: 'Live Class Management',
    description: 'Manage live Yoga, Zumba, and HIIT classes.',
    href: '/admin/classes',
    available: true,
  },
  {
    title: 'Subscription Management',
    description: 'Manage subscription plans and subscriptions.',
    href: '/admin/subscriptions',
    available: true,
  },
  {
    title: 'Diet Plan Management',
    description: 'Manage structured diet plans and meals.',
    href: '#',
    available: false,
  },
];

export default async function AdminDashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>

            <p className="text-gray-600 mb-6">
              You need administrator privileges to access this area.
            </p>

            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-gray-600 mt-1">
            Manage the Fitness Platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>

                {!section.available && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    Coming Next
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm leading-6 mb-6">
                {section.description}
              </p>

              {section.available ? (
                <Link
                  href={section.href}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Manage
                  <span className="ml-2">→</span>
                </Link>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed">
                  Coming Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}