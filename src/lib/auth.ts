/**
 * NextAuth.js v5 Configuration for Duke University SSO
 * 
 * This file configures authentication using Duke's OpenID Connect (OIDC) provider.
 * It handles user sessions, JWT tokens, and Supabase user synchronization.
 */

import NextAuth, { type NextAuthConfig } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

// Supabase admin client (server-side only, uses service role key)
// Initialize only if environment variables are available
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

/**
 * Duke OIDC user profile structure
 * Adjust these fields based on actual Duke OIDC claims
 */
interface DukeProfile {
  sub: string;                    // Subject (unique identifier)
  email: string;                  // Duke email
  name?: string;                  // Full name
  given_name?: string;            // First name
  family_name?: string;           // Last name
  preferred_username?: string;    // NetID
  eduPersonPrincipalName?: string; // Full NetID@duke.edu
  eduPersonAffiliation?: string[]; // Affiliations (student, faculty, staff)
  dukeNetID?: string;             // Duke-specific NetID claim
}

/**
 * Upsert user in Supabase database
 * Creates a new user or updates existing user on login
 */
async function upsertUserInSupabase(profile: DukeProfile) {
  // Skip if Supabase is not configured
  if (!supabaseAdmin) {
    console.warn('Supabase not configured, skipping user upsert');
    return {
      id: profile.sub,
      duke_netid: profile.preferred_username || profile.sub,
      email: profile.email,
      full_name: profile.name || null,
      affiliation: 'unknown',
      duke_attributes: profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };
  }

  try {
    // Extract NetID from various possible claim locations
    const netid = 
      profile.dukeNetID || 
      profile.preferred_username || 
      profile.eduPersonPrincipalName?.split('@')[0] ||
      profile.sub;

    // Extract full name
    const fullName = profile.name || 
      (profile.given_name && profile.family_name 
        ? `${profile.given_name} ${profile.family_name}` 
        : null);

    // Extract primary affiliation
    const affiliation = Array.isArray(profile.eduPersonAffiliation)
      ? profile.eduPersonAffiliation[0]
      : profile.eduPersonAffiliation || 'unknown';

    // Upsert user record
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          duke_netid: netid,
          email: profile.email,
          full_name: fullName,
          affiliation: affiliation,
          duke_attributes: profile, // Store full profile for reference
          last_login_at: new Date().toISOString(),
        },
        {
          onConflict: 'duke_netid',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting user in Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to upsert user:', error);
    throw error;
  }
}

/**
 * Check if user is a Duke student
 */
function isStudent(affiliations: string[] | string | undefined): boolean {
  if (!affiliations) return false;
  
  const affiliationArray = Array.isArray(affiliations) 
    ? affiliations 
    : [affiliations];
  
  return affiliationArray.some(aff => 
    aff.toLowerCase().includes('student')
  );
}

/**
 * NextAuth configuration
 */
export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: 'duke',
      name: 'Duke University',
      type: 'oidc',
      issuer: process.env.DUKE_OIDC_ISSUER,
      clientId: process.env.DUKE_OIDC_CLIENT_ID,
      clientSecret: process.env.DUKE_OIDC_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      profile(profile: DukeProfile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          image: null,
        };
      },
    },
  ],
  
  callbacks: {
    /**
     * JWT callback - runs when JWT is created or updated
     * This is where we add Duke-specific claims to the token
     */
    async jwt({ token, account, profile, trigger }) {
      // On sign in, add Duke profile data to token
      if (account && profile) {
        const dukeProfile = profile as DukeProfile;
        
        // Extract NetID
        const netid = 
          dukeProfile.dukeNetID || 
          dukeProfile.preferred_username || 
          dukeProfile.eduPersonPrincipalName?.split('@')[0] ||
          dukeProfile.sub;

        // Upsert user in Supabase
        try {
          const user = await upsertUserInSupabase(dukeProfile);
          
          // Add custom claims to JWT
          token.dukeNetId = netid;
          token.affiliation = user.affiliation;
          token.isStudent = isStudent(dukeProfile.eduPersonAffiliation);
          token.supabaseUserId = user.id;
          token.fullName = user.full_name;
        } catch (error) {
          console.error('Error in JWT callback:', error);
          // Continue even if Supabase upsert fails
          token.dukeNetId = netid;
          token.affiliation = 'unknown';
          token.isStudent = false;
        }
      }

      // On token refresh, update last login
      if (trigger === 'update' && token.dukeNetId && supabaseAdmin) {
        try {
          await supabaseAdmin
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('duke_netid', token.dukeNetId);
        } catch (error) {
          console.error('Error updating last login:', error);
        }
      }

      return token;
    },

    /**
     * Session callback - runs when session is checked
     * This is where we add custom fields to the session object
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.dukeNetId = token.dukeNetId as string;
        session.user.affiliation = token.affiliation as string;
        session.user.isStudent = token.isStudent as boolean;
        session.user.supabaseUserId = token.supabaseUserId as string;
        session.user.fullName = token.fullName as string;
      }
      return session;
    },

    /**
     * Authorized callback - controls access to protected routes
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isOnProtectedRoute = nextUrl.pathname.startsWith('/courses');

      // Redirect to login if accessing protected route while not logged in
      if (isOnProtectedRoute && !isLoggedIn) {
        return false; // Will redirect to login page
      }

      // Redirect away from login page if already logged in
      if (isOnLoginPage && isLoggedIn) {
        return Response.redirect(new URL('/courses', nextUrl));
      }

      return true;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

/**
 * Extend NextAuth types to include our custom fields
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      dukeNetId: string;
      affiliation: string;
      isStudent: boolean;
      supabaseUserId: string;
      fullName: string;
    };
  }

  interface User {
    dukeNetId?: string;
    affiliation?: string;
    isStudent?: boolean;
    supabaseUserId?: string;
    fullName?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    dukeNetId?: string;
    affiliation?: string;
    isStudent?: boolean;
    supabaseUserId?: string;
    fullName?: string;
  }
}

/**
 * Initialize NextAuth with our configuration
 * Export auth() helper, signIn, signOut, and handlers for App Router
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

