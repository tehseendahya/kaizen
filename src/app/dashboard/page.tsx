'use client';

/**
 * Dashboard Page - Protected Route Example
 * 
 * This is an example of a protected page that requires:
 * - User to be signed in
 * - Email to be verified
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { User } from '@supabase/supabase-js';

function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Welcome to your protected dashboard!</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Your Account Information</h2>
          
          {user && (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Email:</span>
                <span className="text-white font-medium">{user.email}</span>
                {user.email_confirmed_at && (
                  <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
                    ✓ Verified
                  </span>
                )}
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-400 w-32">User ID:</span>
                <span className="text-white font-mono text-sm">{user.id}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Created:</span>
                <span className="text-white">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              
              {user.email_confirmed_at && (
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Email Verified:</span>
                  <span className="text-white">
                    {new Date(user.email_confirmed_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Protected Content Example */}
        <div className="mt-6 bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Protected Content</h2>
          <p className="text-gray-300 mb-4">
            This is a protected area of your application. Only authenticated users with verified
            emails can see this content.
          </p>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 font-mono">
              This page is wrapped with the ProtectedRoute component, which ensures that:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400 font-mono">
              <li>✓ User is authenticated</li>
              <li>✓ Email is verified</li>
              <li>✓ Session is active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

