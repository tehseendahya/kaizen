/**
 * NextAuth.js v5 Route Handler for Next.js 15 App Router
 * 
 * This file exports GET and POST handlers for NextAuth authentication.
 * All auth-related routes (sign in, sign out, callbacks) are handled here.
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;

