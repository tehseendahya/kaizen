/**
 * Client-side authentication hook
 * 
 * Use this in Client Components to access session data
 */

'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isStudent: session?.user?.isStudent || false,
    dukeNetId: session?.user?.dukeNetId,
    affiliation: session?.user?.affiliation,
  };
}

