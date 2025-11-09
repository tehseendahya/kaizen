'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import IconAxis from '@/components/icons/IconAxis';

type AuthMode = 'login' | 'signup-student' | 'signup-professor';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: AuthMode;
}

export function AuthDialog({ open, onOpenChange, initialMode = 'login' }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [school, setSchool] = useState('');
  const [subjectOfStudy, setSubjectOfStudy] = useState('');
  const [role, setRole] = useState<'student' | 'professor'>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Reset form when mode changes
  useEffect(() => {
    setError(null);
    setEmail('');
    setPassword('');
    setUsername('');
    setSchool('');
    setSubjectOfStudy('');
    setRole('student');
  }, [mode]);

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

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
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        onOpenChange(false);
        
        if (profile?.role === 'professor' || profile?.role === 'admin' || localStorage.getItem('axis:role') === 'professor') {
          router.push('/prof'); // Goes directly to course creation page
        } else {
          router.push('/courses');
        }
        router.refresh();
      }
    } catch (error: any) {
      if (error.message === 'Email not confirmed') {
        setError('Please check your email and click the verification link before signing in. Check your spam folder if needed.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else {
        setError(error.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profileUsername = username.trim() || email.split('@')[0];
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: profileUsername,
            role: 'student',
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const response = await fetch('/api/profile/ensure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'student',
              username: profileUsername,
            }),
          });

          if (!response.ok) {
            console.error('Profile creation error via API');
            setError('Account created! You can try logging in - your profile will be created automatically.');
            setTimeout(() => {
              setMode('login');
            }, 3000);
            return;
          }

          if (authData.session) {
            onOpenChange(false);
            router.push('/courses');
            router.refresh();
          } else {
            setError('Please check your email to confirm your account before signing in.');
            setTimeout(() => {
              setMode('login');
            }, 3000);
          }
        } catch (error: any) {
          console.error('Unexpected error during profile creation:', error);
          setError('Account created! If you have issues, try logging in.');
          setTimeout(() => {
            setMode('login');
          }, 3000);
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessorSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profileUsername = username.trim() || email.split('@')[0];
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            username: profileUsername,
            role: 'professor',
            school: school.trim(),
            subject_of_study: subjectOfStudy.trim(),
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        console.log('User created, setting up professor profile...');
        
        try {
          // Create professor profile directly in user_profiles table
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{
              id: authData.user.id,
              first_name: profileUsername.split(' ')[0] || 'Professor',
              last_name: profileUsername.split(' ').slice(1).join(' ') || 'User',
              email: email,
              university: school.trim() || null,
              role: 'professor',
              selected_courses: []
            }]);

          if (profileError) {
            console.error('Direct profile creation failed:', profileError);
            
            // Fallback: try the API route
            try {
              const response = await fetch('/api/profile/ensure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  role: 'professor',
                  username: profileUsername,
                  userId: authData.user.id,
                }),
              });
              
              if (!response.ok) {
                throw new Error('API route also failed');
              }
            } catch (apiError) {
              console.error('Both profile creation methods failed:', apiError);
              setError('Account created but profile setup failed. Please contact support.');
              return;
            }
          }

          // Verify the profile was created correctly
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (authData.session) {
            if (profile?.role === 'professor') {
              console.log('Professor profile created successfully!');
              onOpenChange(false);
              router.push('/prof');
              router.refresh();
            } else {
              console.error('Profile role verification failed:', profile);
              setError('Account created but role not set correctly. Please try logging in.');
              setMode('login');
            }
          } else {
            setError(null);
            alert('Account created! Please check your email to confirm your account before signing in.');
            setMode('login');
          }
        } catch (error: any) {
          console.error('Unexpected error during professor profile setup:', error);
          setError('Account created but setup incomplete. Please try logging in or contact support.');
          setTimeout(() => {
            setMode('login');
          }, 3000);
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (mode === 'login') {
      return (
        <>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-sm text-slate-600 mb-6">Sign in to continue your learning journey</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
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
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Don&apos;t have an account? </span>
            <button
              onClick={() => setMode('signup-student')}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer bg-transparent border-none p-0"
            >
              Sign up
            </button>
          </div>
        </>
      );
    }

    if (mode === 'signup-student') {
      return (
        <>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Create your account</h1>
          <p className="text-sm text-slate-600 mb-6">Start your personalized learning journey</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleStudentSignup} className="space-y-4">
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
            <button
              onClick={() => setMode('login')}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </div>
          <div className="mt-3 text-center">
            <button
              onClick={() => setMode('signup-professor')}
              className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer bg-transparent border-none p-0"
            >
              Sign up as professor instead
            </button>
          </div>
        </>
      );
    }

    if (mode === 'signup-professor') {
      return (
        <>
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253" />
              </svg>
              Professor Signup
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Create your professor account</h1>
            <p className="text-sm text-slate-600">Upload and manage course content for your students</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleProfessorSignup} className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject of Study</Label>
              <Input
                id="subject"
                type="text"
                placeholder="e.g., Computer Science, Physics, Mathematics"
                value={subjectOfStudy}
                onChange={(e) => setSubjectOfStudy(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="school">School/University</Label>
              <Input
                id="school"
                type="text"
                placeholder="e.g., Duke University"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

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
                placeholder="you@university.edu"
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign up as Professor'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <button
              onClick={() => setMode('login')}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </div>
          <div className="mt-3 text-center">
            <button
              onClick={() => setMode('signup-student')}
              className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer bg-transparent border-none p-0"
            >
              Sign up as student instead
            </button>
          </div>
        </>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2 group">
              <IconAxis size={28} className="transition-transform group-hover:rotate-12" />
              <span className="text-xl font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Axis
              </span>
            </Link>
          </div>
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

