"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

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
      setError(null);
      setEmail('');
      setPassword('');
    }
  }, [open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Check user's role in database to determine redirect
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        onOpenChange(false);
        
        if (profile?.role === 'professor' || profile?.role === 'admin' || localStorage.getItem('axis:role') === 'professor') {
          router.push('/prof'); // Goes directly to course creation page
        } else {
          // For students and users without profiles
          router.push('/courses');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message === 'Email not confirmed') {
        setError('Please check your email and click the verification link before signing in. Check your spam folder if needed.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900">Welcome back</DialogTitle>
          <p className="text-sm text-slate-600 mt-2">Sign in to continue your learning journey</p>
        </DialogHeader>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          {/* Email Field */}
          <div>
            <Label htmlFor="login-email">Email address</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              // Open signup (you can implement this based on your routing)
              router.push('/signup');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}