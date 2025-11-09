'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconAxis from '@/components/icons/IconAxis';

export default function ProfessorSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [school, setSchool] = useState('');
  const [subjectOfStudy, setSubjectOfStudy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profileUsername = username.trim() || email.split('@')[0];
      
      // Sign up the user with role in metadata (so trigger can read it)
      // Enable email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            username: profileUsername,
            role: 'professor',  // Always professor for this page
            school: school.trim(),
            subject_of_study: subjectOfStudy.trim(),
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Wait a bit longer to ensure trigger has run
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          // Use API route (server-side, uses service role to bypass RLS)
          // Pass userId in body since session might not be set yet
          let profileApiSuccess = false;
          try {
            console.log('📤 Calling profile API with userId:', authData.user.id);
            
            const response = await fetch('/api/profile/ensure', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                role: 'professor',
                username: profileUsername,
                userId: authData.user.id,
              }),
            });

            const responseText = await response.text();
            let responseData: any = null;
            
            if (responseText.trim()) {
              try {
                responseData = JSON.parse(responseText);
              } catch (e) {
                responseData = { error: 'Invalid JSON', raw: responseText.substring(0, 100) };
              }
            }

            console.log('📥 Profile API response:', {
              ok: response.ok,
              status: response.status,
              statusText: response.statusText,
              data: responseData
            });

            if (response.ok) {
              console.log('✅ Profile created via API');
              profileApiSuccess = true;
            } else {
              const errorMsg = responseData?.error || responseData?.details || responseData?.message || response.statusText;
              console.error('❌ Profile API error:', {
                status: response.status,
                error: errorMsg,
                details: responseData?.details,
                hint: responseData?.hint
              });
            }
          } catch (fetchError) {
            console.error('❌ Failed to call profile API:', fetchError);
          }

          // Continue even if API fails - database trigger should handle it
          if (!profileApiSuccess) {
            console.warn('⚠️ Profile API failed, database trigger should create profile...');
          }

          // Wait a moment for database to sync (trigger might still be running)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify the role was set correctly (use maybeSingle to avoid errors)
          console.log('🔍 Verifying profile creation...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('id', authData.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('❌ Error fetching profile:', {
              message: profileError.message,
              code: profileError.code,
              details: profileError.details,
              hint: profileError.hint,
            });
          }
          
          console.log('📋 Profile status:', {
            exists: !!profile,
            role: profile?.role || 'none',
            username: profile?.username || 'none',
            expected: 'professor'
          });
          
          // If profile doesn't exist or role is wrong, try to fix it
          if (!profile || profile.role !== 'professor') {
            console.warn(`Profile role issue: Expected professor, got ${profile?.role || 'undefined'}. Attempting fix...`);
            
            // Wait a bit more for trigger
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try API route one more time
            try {
              const retryResponse = await fetch('/api/profile/ensure', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  role: 'professor',
                  username: profileUsername,
                  userId: authData.user.id,
                }),
              });
              
              if (!retryResponse.ok) {
                const retryText = await retryResponse.text();
                let retryData: any = {};
                try {
                  retryData = JSON.parse(retryText);
                } catch {
                  retryData = { error: retryText };
                }
                console.warn('Retry failed:', {
                  status: retryResponse.status,
                  error: retryData.error || 'Unknown',
                  details: retryData.details || '',
                });
              } else {
                console.log('Retry succeeded');
              }
            } catch (retryError: any) {
              console.warn('Retry request failed:', retryError?.message || 'Unknown error');
            }
            
            // Check one more time
            const { data: finalCheck } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', authData.user.id)
              .maybeSingle();
            
            if (finalCheck?.role === 'professor') {
              console.log('Profile role fixed!');
            } else {
              console.warn('Profile role still not set correctly. Will be fixed on login via API route.');
            }
          }

          // Check if email confirmation is required
          if (authData.session) {
            // User is immediately signed in (email confirmation disabled in Supabase settings)
            // Verify role one more time before redirecting
            const { data: finalProfile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', authData.user.id)
              .maybeSingle();
            
            if (finalProfile?.role === 'professor') {
              console.log('Profile verified - redirecting to professor portal');
              router.push('/prof');
              router.refresh();
            } else {
              // Role not set correctly, but user is signed in
              // The API route will fix it on next login, but for now redirect to login
              console.warn('Role not set correctly, but account created. Will be fixed on login.');
              setError('Account created! Please sign in to complete setup.');
              router.push('/login');
            }
          } else {
            // Email confirmation required - show success message
            // Don't block on profile errors - trigger should have created it
            setError(null);
            setLoading(false);
            alert('Account created! Please check your email to confirm your account before signing in.');
            router.push('/login');
            return;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <IconAxis size={32} className="transition-transform group-hover:rotate-12" />
            <span className="text-2xl font-semibold tracking-tight text-slate-900 group-hover:text-green-600 transition-colors">
              Axis
            </span>
          </Link>
        </div>

        {/* Professor Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-8">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-2">
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

          <form onSubmit={handleSignup} className="space-y-4">
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
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign up as Professor'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
              Sign in
            </Link>
          </div>
          <div className="mt-3 text-center">
            <Link 
              href="/signup" 
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Sign up as student instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

