'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthDialog } from './AuthDialog';

type AuthMode = 'login' | 'signup-student' | 'signup-professor';

export function openAuth(mode: AuthMode = 'login') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('axis:openAuth', { detail: { mode } }));
  }
}

export function AuthRoot() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<AuthMode>('login');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for auth query parameters on mount and when they change
  React.useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'login') {
      setMode('login');
      setOpen(true);
    } else if (authParam === 'signup') {
      setMode('signup-student');
      setOpen(true);
    } else if (authParam === 'signup-professor') {
      setMode('signup-professor');
      setOpen(true);
    }
  }, [searchParams]);

  // Listen for custom events
  React.useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ mode: AuthMode }>;
      setMode(ev.detail?.mode || 'login');
      setOpen(true);
    };
    window.addEventListener('axis:openAuth', handler as EventListener);
    return () => window.removeEventListener('axis:openAuth', handler as EventListener);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Clean up URL parameters when closing
    if (!isOpen && searchParams.get('auth')) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('auth');
      const newUrl = newParams.toString() ? `?${newParams.toString()}` : '/';
      router.replace(newUrl);
    }
  };

  return <AuthDialog open={open} onOpenChange={handleOpenChange} initialMode={mode} />;
}

