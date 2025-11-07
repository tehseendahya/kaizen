/**
 * Login Page
 * 
 * Duke University SSO login page with "Sign in with Duke" button
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-utils';
import LoginButton from '@/components/auth/LoginButton';

export default async function LoginPage() {
  // Redirect if already logged in
  const session = await getSession();
  if (session?.user) {
    redirect('/courses');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo / Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Axis
          </h1>
          <p className="text-lg text-gray-600">
            Learning Platform for Duke Students
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in with your Duke NetID to continue
            </p>
          </div>

          {/* Duke SSO Button */}
          <LoginButton />

          {/* Info Section */}
          <div className="pt-6 border-t border-gray-200 space-y-3">
            <div className="flex items-start space-x-3">
              <svg 
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Secure Authentication
                </p>
                <p className="text-sm text-gray-600">
                  We use Duke&apos;s official SSO system. Your credentials are never stored on our servers.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <svg 
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Duke Students Only
                </p>
                <p className="text-sm text-gray-600">
                  Access to course materials is restricted to current Duke University students.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

