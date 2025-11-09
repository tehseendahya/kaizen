'use client';
import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoginDialog } from '@/components/LoginDialog';

export function openLogin() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('axis:openLogin'));
  }
}

export function LoginRoot() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  
  React.useEffect(() => {
    const h = () => {
      setOpen(true);
    };
    window.addEventListener('axis:openLogin', h as EventListener);
    return () => window.removeEventListener('axis:openLogin', h as EventListener);
  }, []);

  // Also handle URL parameter for opening login
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === 'true') {
        setOpen(true);
        // Clean up URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('login');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // If dialog is closed and we're on the /login page, redirect to home
    if (!newOpen && pathname === '/login') {
      // Preserve redirect parameter if it exists
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect');
      if (redirectTo) {
        // If there's a redirect, go to home and let middleware handle it
        router.push('/');
      } else {
        router.push('/');
      }
    }
  };

  return <LoginDialog open={open} onOpenChange={handleOpenChange} />;
}

