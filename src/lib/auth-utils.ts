/**
 * Authentication Utilities for NextAuth v5
 * 
 * Helper functions for checking auth status and protecting routes
 * Uses the new auth() helper instead of getServerSession
 */

import { auth } from './auth';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

/**
 * Get the current session (server-side only)
 * Use this in Server Components, Route Handlers, and Server Actions
 */
export async function getSession(): Promise<Session | null> {
  return await auth();
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use this at the top of protected Server Components
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  return session;
}

/**
 * Require student authentication - redirect if not a Duke student
 * Use this to protect student-only resources
 */
export async function requireStudent(): Promise<Session> {
  const session = await requireAuth();
  
  if (!session.user.isStudent) {
    redirect('/access-denied');
  }
  
  return session;
}

/**
 * Check if user is authenticated (returns boolean)
 * Use this when you need to conditionally render based on auth status
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Check if user is a student (returns boolean)
 */
export async function isStudent(): Promise<boolean> {
  const session = await auth();
  return session?.user?.isStudent || false;
}

/**
 * Get current user's Duke NetID
 */
export async function getCurrentNetId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.dukeNetId || null;
}

/**
 * Get current user's Supabase user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.supabaseUserId || null;
}
