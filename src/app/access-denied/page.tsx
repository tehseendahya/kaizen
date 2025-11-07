/**
 * Access Denied Page
 * 
 * Shown when a non-student tries to access student-only content
 */

import Link from 'next/link';
import { getSession } from '@/lib/auth-utils';

export default async function AccessDeniedPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-10 h-10 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Access Denied
          </h1>

          {/* Message */}
          {session?.user ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Hi {session.user.fullName || session.user.dukeNetId},
              </p>
              <p className="text-gray-600">
                This content is restricted to Duke University students only. 
                Your account is registered as: <strong className="text-gray-900">{session.user.affiliation}</strong>
              </p>
              <p className="text-sm text-gray-500">
                If you believe this is an error, please contact support or verify your Duke affiliation status.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              You need to be signed in as a Duke student to access this content.
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Link
              href="/courses"
              className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Browse Available Courses
            </Link>
            
            {!session?.user && (
              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

