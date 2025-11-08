'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconAxis from '@/components/icons/IconAxis';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Ensure profile exists using server-side API route
        // This avoids RLS timing issues
        try {
          const response = await fetch('/api/profile/ensure', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            let errorData: any = {};
            let responseText = '';
            try {
              responseText = await response.text();
              if (responseText && responseText.trim()) {
                try {
                  errorData = JSON.parse(responseText);
                } catch (parseError) {
                  errorData = { error: responseText, raw: responseText };
                }
              } else {
                errorData = { error: 'Empty response', status: response.status };
              }
            } catch (readError: any) {
              errorData = {
                error: 'Failed to read error response',
                readError: readError?.message || 'Unknown error',
                status: response.status,
                statusText: response.statusText,
              };
            }
            
            // Build comprehensive error details
            const errorDetails: any = {
              status: response.status || 'unknown',
              statusText: response.statusText || 'unknown',
              url: response.url || 'unknown',
            };
            
            // Extract all error properties
            if (errorData && typeof errorData === 'object') {
              if (errorData.error) errorDetails.error = errorData.error;
              if (errorData.details) errorDetails.details = errorData.details;
              if (errorData.code) errorDetails.code = errorData.code;
              if (errorData.hint) errorDetails.hint = errorData.hint;
              if (errorData.message) errorDetails.message = errorData.message;
              if (errorData.raw) errorDetails.raw = errorData.raw;
            } else if (errorData) {
              errorDetails.error = String(errorData);
            }
            
            // Ensure we have at least one error message
            if (!errorDetails.error && !errorDetails.details) {
              errorDetails.error = `HTTP ${errorDetails.status}: ${errorDetails.statusText}`;
            }
            
            console.error('Profile ensure error:', errorDetails);
            // Continue anyway - profile can be created later via trigger
          }
        } catch (apiError: any) {
          console.error('Failed to ensure profile:', {
            error: apiError?.message || 'Unknown error',
            type: apiError?.name || 'Error',
          });
          // Continue anyway - not critical for login
        }

        // Check user role and redirect accordingly
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        // Check for redirect parameter (e.g., from middleware)
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');

        if (redirectTo) {
          router.push(redirectTo);
        } else if (profile?.role === 'professor' || profile?.role === 'admin') {
          router.push('/prof');
        } else {
          router.push('/courses');
        }
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <IconAxis size={32} className="transition-transform group-hover:rotate-12" />
            <span className="text-2xl font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Axis
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-sm text-slate-600 mb-6">Sign in to continue your learning journey</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-sm">
              <span className="text-slate-600">Don't have an account? </span>
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </div>
            <div className="text-center">
              <Link 
                href="/signup/professor" 
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Sign up as professor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

