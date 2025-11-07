'use client';

/**
 * Email Verification Callback Page
 * 
 * This page handles the redirect after a user clicks the email verification link.
 * Supabase automatically exchanges the token in the URL for a valid session.
 * 
 * Flow:
 * 1. User clicks verification link in email
 * 2. Supabase redirects to this page with auth token in URL
 * 3. We call getUser() to complete the verification
 * 4. Redirect to dashboard on success
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the current session - this automatically processes the token from the URL
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setMessage('Email verification failed. The link may be invalid or expired.');
          return;
        }

        if (user) {
          // Check if email is confirmed
          if (user.email_confirmed_at) {
            setStatus('success');
            setMessage('Your email has been verified! 🎉');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          } else {
            // Edge case: user exists but email not confirmed
            setStatus('error');
            setMessage('Email verification is pending. Please check your inbox for the verification link.');
          }
        } else {
          // No user found
          setStatus('error');
          setMessage('No user session found. Please try signing in.');
          
          // Redirect to sign in after delay
          setTimeout(() => {
            router.push('/auth/signin');
          }, 3000);
        }
      } catch (err) {
        console.error('Unexpected error during verification:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailVerification();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <svg
                  className="animate-spin h-12 w-12 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>
              <p className="text-gray-400 text-sm">Please wait while we verify your email address...</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>
              <p className="text-gray-400 text-sm">Redirecting you to your dashboard...</p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-red-300 text-sm mb-6">{message}</p>
              <button
                onClick={() => router.push('/auth/signin')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

