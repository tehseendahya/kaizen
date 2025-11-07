'use client';

/**
 * Protected Route Wrapper
 * 
 * Use this component to protect routes that require:
 * 1. User to be signed in
 * 2. Email to be verified
 * 
 * Usage in your app:
 * ```tsx
 * import ProtectedRoute from '@/components/auth/ProtectedRoute';
 * 
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Your protected content here</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean; // Default: true
}

export default function ProtectedRoute({ 
  children, 
  requireEmailVerification = true 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current user
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();

        if (error || !currentUser) {
          // Not authenticated - redirect to sign in
          router.push('/auth/signin');
          return;
        }

        // Check email verification if required
        if (requireEmailVerification && !currentUser.email_confirmed_at) {
          // Email not verified - redirect to verification page
          router.push('/auth/verify-email');
          return;
        }

        // All checks passed
        setUser(currentUser);
        setLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth/signin');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/auth/signin');
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Check verification on sign in
          if (requireEmailVerification && !session.user.email_confirmed_at) {
            router.push('/auth/verify-email');
          } else {
            setUser(session.user);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, requireEmailVerification]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
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
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Render protected content only if authenticated and verified
  return user ? <>{children}</> : null;
}

