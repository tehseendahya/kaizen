'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconAxis from '@/components/icons/IconAxis';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Wait a moment for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create profile using server-side API route to avoid RLS issues
        const profileUsername = username.trim() || email.split('@')[0];
        
        try {
          // First try direct insert (faster if it works)
          const { error: directError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              username: profileUsername,
            });

          // If direct insert fails, use API route (server-side)
          if (directError) {
            console.log('Direct insert failed, trying API route:', directError);
            const response = await fetch('/api/profile/ensure', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Profile creation error via API:', errorData);
              // Show error but don't block - database trigger might create it
              setError(`Account created! Profile setup had issues. You can try logging in - your profile will be created automatically.`);
              setTimeout(() => {
                router.push('/login');
              }, 3000);
              return;
            }
          }

          // Check if email confirmation is required
          if (authData.session) {
            // User is immediately signed in (email confirmation disabled)
            router.push('/courses');
            router.refresh();
          } else {
            // Email confirmation required - show message
            setError(null);
            alert('Please check your email to confirm your account before signing in.');
            router.push('/login');
          }
        } catch (error: any) {
          console.error('Unexpected error during profile creation:', error);
          // Account is created, profile might be created by trigger
          setError('Account created! If you have issues, try logging in.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup');
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

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Create your account</h1>
          <p className="text-sm text-slate-600 mb-6">Start your personalized learning journey</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

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
                minLength={6}
                disabled={loading}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

