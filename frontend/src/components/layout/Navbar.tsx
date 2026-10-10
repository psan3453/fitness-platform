'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/lib/auth/actions';
import { SafeUser } from '@/lib/auth/types';

export default function Navbar({ user }: { user: SafeUser | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
              Fitness<span className="text-blue-600">Platform</span>
            </Link>
          </div>

          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link href="/trainers" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Find Trainers</Link></li>
              <li><Link href="/subscriptions" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Plans</Link></li>
              {user && user.role !== 'ADMIN' && (
                <li><Link href="/my-trainers" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">My Trainers</Link></li>
              )}
              <li><Link href="/classes" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Classes</Link></li>
              <li><Link href="/diet-plans" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Diet Plans</Link></li>
              {user?.role !== 'TRAINER' && user?.role !== 'ADMIN' && (
                <li><Link href="/trainers/apply" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Become a Trainer</Link></li>
              )}
              {user?.role === 'ADMIN' && (
                  <li>
                      <Link
                        href="/admin"
                        className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        Admin
                      </Link>
                    </li>
                  )}
            </ul>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                {user.role === 'TRAINER' && (
                  <Link href="/trainer/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Trainer Hub
                  </Link>
                )}
                <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Profile
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Login
                </Link>
                <Link href="/register" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-gray-200 bg-white">
          <ul className="space-y-1 px-4 py-4">
            <li><Link href="/" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">Home</Link></li>
            <li><Link href="/trainers" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">Find Trainers</Link></li>
            <li><Link href="/subscriptions" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">Plans</Link></li>
            {user && user.role !== 'ADMIN' && (
              <li><Link href="/my-trainers" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">My Trainers</Link></li>
            )}
            <li><Link href="/classes" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">Classes</Link></li>
            <li><Link href="/diet-plans" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">Diet Plans</Link></li>
            {user?.role !== 'TRAINER' && user?.role !== 'ADMIN' && (
              <li><Link href="/trainers/apply" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">Become a Trainer</Link></li>
            )}
          </ul>
          <div className="border-t border-gray-200 px-4 py-4 flex flex-col space-y-3">
            {user ? (
              <>
                {user.role === 'TRAINER' && (
                  <Link href="/trainer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center rounded-md px-3 py-2 text-base font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                    Trainer Hub
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Profile
                </Link>
                <form action={logoutAction} className="block">
                  <button type="submit" className="w-full text-center rounded-md bg-gray-100 px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
