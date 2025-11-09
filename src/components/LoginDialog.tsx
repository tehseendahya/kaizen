"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconAxis from '@/components/icons/IconAxis';

export function LoginDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const supabase = createClient();

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

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
            
            const errorDetails: any = {
              status: response.status || 'unknown',
              statusText: response.statusText || 'unknown',
              url: response.url || 'unknown',
            };
            
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
            
            if (!errorDetails.error && !errorDetails.details) {
              errorDetails.error = `HTTP ${errorDetails.status}: ${errorDetails.statusText}`;
            }
            
            console.error('Profile ensure error:', errorDetails);
          }
        } catch (apiError: any) {
          console.error('Failed to ensure profile:', {
            error: apiError?.message || 'Unknown error',
            type: apiError?.name || 'Error',
          });
        }

        // Check user role and redirect accordingly
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        // Close dialog before redirect
        onOpenChange(false);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2 group">
              <IconAxis size={32} className="transition-transform group-hover:rotate-12" />
              <span className="text-2xl font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Axis
              </span>
            </Link>
          </div>
          <DialogTitle className="text-2xl font-semibold text-slate-900 text-center">Welcome back</DialogTitle>
          <p className="text-sm text-slate-600 text-center">Sign in to continue your learning journey</p>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
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
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
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
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                // Import and use the openOnboarding function
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('axis:openOnboarding'));
                }
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </button>
          </div>
          <div className="text-center">
            <Link 
              href="/signup/professor" 
              onClick={() => onOpenChange(false)}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Sign up as professor
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

