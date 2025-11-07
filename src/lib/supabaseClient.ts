/**
 * Supabase Client for Email/Password Authentication
 * 
 * This is a browser-compatible Supabase client specifically configured
 * for client-side authentication flows (sign up, sign in, email verification).
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file'
  );
}

/**
 * Client-side Supabase client with auth persistence
 * This client automatically handles:
 * - Session persistence across page reloads
 * - Token refresh
 * - Auth state changes
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Important for email verification callback
  },
});

/**
 * Database Types
 * Extend this as needed for your database schema
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
}

