"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import IconAxis from '@/components/icons/IconAxis';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { openOnboarding } from '@/lib/onboarding';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/profile';

export function AxisNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      // Fetch profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data);
          }
        });
    } else {
      setProfile(null);
    }
  }, [user, supabase]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const isAuthenticated = !!user;
  const initials = profile?.username
    ? profile.username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  const navLinks = [
    { name: 'Courses', href: '/courses' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Research', href: '/research' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
  ];

  const NavLinks = () => (
    <nav className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-sm font-medium text-slate-600">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`transition-colors hover:text-blue-600 ${pathname === link.href ? 'text-blue-600 font-semibold' : ''}`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl h-14 flex items-center justify-between px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <IconAxis size={20} className="transition-transform group-hover:rotate-12" />
          <span className="font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Axis
          </span>
        </Link>

        {/* Center: Nav Links */}
        <div className="hidden md:block">
          <NavLinks />
        </div>

        {/* Right: Auth state */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button aria-label="Notifications" className="relative rounded-full p-2 hover:bg-slate-50">
                <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-600" />
              </button>

              {/* Student Chips */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">Sophomore</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">3.92 GPA</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">6 Courses</span>
              </div>

              {/* Avatar + name */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {initials}
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-sm font-medium">{profile?.username || user?.email?.split('@')[0] || 'User'}</span>
                  <span className="text-xs text-slate-500">{profile?.school || 'Student'}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-2 text-xs text-slate-500 hover:text-slate-700"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-blue-600">
                Log in
              </Link>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  openOnboarding();
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:opacity-90"
              >
                Sign up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-9 w-9 rounded-full p-0" aria-label="Open menu">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="space-y-6">
                <NavLinks />
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                        {initials}
                      </div>
                      <div className="leading-tight">
                        <div className="text-slate-900 text-sm font-semibold">
                          {profile?.username || user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-slate-500 text-xs">{profile?.school || 'Student'}</div>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleSignOut} className="w-full">
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login" className="text-sm text-slate-600 hover:text-blue-600">Log in</Link>
                    <Button onClick={() => openOnboarding()}>Sign up</Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

