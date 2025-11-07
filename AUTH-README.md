# Duke University SSO Authentication - Setup Guide

This document explains how Duke University Single Sign-On (SSO) authentication is implemented in the Axis learning platform using OAuth2/OpenID Connect.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Variables](#environment-variables)
4. [Duke Authentication Manager Setup](#duke-authentication-manager-setup)
5. [Database Schema](#database-schema)
6. [Local Development](#local-development)
7. [Production Deployment](#production-deployment)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Authentication Flow

1. User clicks "Sign in with Duke NetID"
2. User is redirected to Duke's official SSO login page
3. User enters their Duke NetID and password
4. Duke authenticates the user and redirects back to our app
5. NextAuth.js validates the response and creates a session
6. User information is stored/updated in Supabase database
7. User is redirected to the courses page

### Tech Stack

- **NextAuth.js v5** - Authentication framework for Next.js 15 App Router
- **Duke OIDC** - Duke's OpenID Connect provider
- **Supabase** - PostgreSQL database for user data
- **JWT** - Session management with secure HTTP-only cookies

---

## Architecture

### Key Files

```
src/
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   └── auth-utils.ts              # Server-side auth helpers
├── hooks/
│   └── useAuth.ts                 # Client-side auth hook
├── components/
│   └── auth/
│       ├── SessionProvider.tsx    # Session context provider
│       ├── LoginButton.tsx        # Duke SSO login button
│       └── UserMenu.tsx           # User dropdown menu
├── app/
│   ├── layout.tsx                 # Root layout with SessionProvider
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── access-denied/
│   │   └── page.tsx              # Access denied page
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts       # NextAuth route handler
```

### Authentication Callbacks

#### JWT Callback
- Runs when JWT is created or updated
- Upserts user in Supabase database
- Adds Duke-specific claims to token (NetID, affiliation, etc.)

#### Session Callback
- Runs when session is checked
- Exposes user fields to client components

#### Authorized Callback
- Controls access to protected routes
- Redirects unauthenticated users to login page

---

## Environment Variables

### Required Variables

Add these to your `.env.local` file:

```bash
# Google Gemini AI (existing)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://hnseoyisugkupiexpzdf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Supabase Service Role Key (NEW - for server-side user management)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# NextAuth.js (NEW)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Duke SSO (NEW)
DUKE_OIDC_ISSUER=https://shib.oit.duke.edu/idp/profile/oidc
DUKE_OIDC_CLIENT_ID=your_duke_client_id_here
DUKE_OIDC_CLIENT_SECRET=your_duke_client_secret_here
```

### Generating NEXTAUTH_SECRET

Run this command to generate a secure random secret:

```bash
openssl rand -base64 32
```

### Getting Supabase Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the `service_role` key (NOT the `anon` key)
5. ⚠️ **IMPORTANT**: Never expose this key to the client

---

## Duke Authentication Manager Setup

### Step 1: Register Your Application

1. Go to [Duke Authentication Manager](https://oit.duke.edu/help/articles/kb0028318)
2. Log in with your Duke NetID
3. Click **"Register New Application"**
4. Fill in the application details:
   - **Application Name**: Axis Learning Platform
   - **Application Type**: Web Application
   - **OAuth2 Grant Type**: Authorization Code
   - **Client Type**: Confidential

### Step 2: Configure Redirect URIs

Add these redirect URIs to your Duke application:

**For Local Development:**
```
http://localhost:3000/api/auth/callback/duke
```

**For Production:**
```
https://your-production-domain.com/api/auth/callback/duke
```

⚠️ **CRITICAL**: The redirect URI must EXACTLY match what you configure in Duke's system, including the protocol (`http` vs `https`), domain, and path.

### Step 3: Configure Scopes

Request these OAuth2 scopes:
- `openid` (required)
- `profile` (recommended)
- `email` (recommended)
- `eduPersonAffiliation` (for student verification - if available)

### Step 4: Get Your Credentials

After registration, Duke will provide:
- **Client ID** - Copy this to `DUKE_OIDC_CLIENT_ID`
- **Client Secret** - Copy this to `DUKE_OIDC_CLIENT_SECRET`

### Step 5: Note the OIDC Issuer

Duke's OIDC issuer URL is:
```
https://shib.oit.duke.edu/idp/profile/oidc
```

Copy this to `DUKE_OIDC_ISSUER`.

### Duke-Specific Claims

Duke OIDC may provide these claims (adjust `src/lib/auth.ts` if needed):
- `sub` - Unique identifier
- `preferred_username` - NetID
- `email` - Duke email
- `name` - Full name
- `given_name` - First name
- `family_name` - Last name
- `eduPersonPrincipalName` - NetID@duke.edu
- `eduPersonAffiliation` - Array of affiliations (student, faculty, staff)
- `dukeNetID` - Duke-specific NetID claim (if available)

⚠️ **NOTE**: The exact claim names may vary. Check Duke's OIDC documentation and adjust the `DukeProfile` interface in `src/lib/auth.ts` accordingly.

---

## Database Schema

### Run the SQL Schema

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `supabase-schema.sql`
5. Paste and run the SQL

This creates:
- `users` table - Stores Duke user information
- `course_progress` table - Tracks student progress (optional)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamp updates

### Users Table Schema

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duke_netid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  affiliation TEXT,
  duke_attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### 3. Run Database Migrations

Execute the SQL in `supabase-schema.sql` in your Supabase SQL Editor.

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test Authentication

1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with Duke NetID"
3. You should be redirected to Duke's login page
4. After successful login, you'll be redirected back to `/courses`

### 6. Verify Database

Check your Supabase dashboard to confirm a user record was created in the `users` table.

---

## Production Deployment

### 1. Update Environment Variables

In your production environment (e.g., Vercel):

```bash
NEXTAUTH_URL=https://your-production-domain.com
DUKE_OIDC_CLIENT_ID=your_production_client_id
DUKE_OIDC_CLIENT_SECRET=your_production_client_secret
# ... other variables
```

### 2. Update Duke Redirect URI

In Duke Authentication Manager, add your production redirect URI:
```
https://your-production-domain.com/api/auth/callback/duke
```

### 3. Deploy

Deploy your application to your hosting platform (Vercel, etc.).

### 4. Test Production Login

1. Navigate to your production URL
2. Test the complete login flow
3. Verify user creation in Supabase

---

## Usage Examples

### Protecting a Server Component

```typescript
import { requireStudent } from '@/lib/auth-utils';

export default async function ProtectedPage() {
  // Redirect to login if not authenticated or not a student
  const session = await requireStudent();
  
  return (
    <div>
      <h1>Welcome, {session.user.fullName}!</h1>
      <p>Your NetID: {session.user.dukeNetId}</p>
    </div>
  );
}
```

### Using Auth in Client Components

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, isStudent } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return (
    <div>
      <p>Hello, {user.fullName}!</p>
      {isStudent && <p>You have access to student content</p>}
    </div>
  );
}
```

### Protecting a Route with Layout

```typescript
// src/app/courses/cs201/layout.tsx
import { requireStudent } from '@/lib/auth-utils';

export default async function CS201Layout({ children }: { children: React.ReactNode }) {
  await requireStudent();
  return <>{children}</>;
}
```

### Getting Current User in API Route

```typescript
import { getSession } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use session.user.dukeNetId, session.user.supabaseUserId, etc.
  return NextResponse.json({ user: session.user });
}
```

---

## Troubleshooting

### Issue: "Invalid supabaseUrl" Error

**Solution**: Ensure `NEXT_PUBLIC_SUPABASE_URL` is set correctly in `.env.local` and restart your dev server.

### Issue: "Missing Supabase environment variables"

**Solution**: Check that both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.

### Issue: "NEXTAUTH_SECRET is not set"

**Solution**: Generate a secret with `openssl rand -base64 32` and add it to `.env.local`.

### Issue: Redirect URI Mismatch

**Solution**: Ensure the redirect URI in Duke Authentication Manager EXACTLY matches:
- Local: `http://localhost:3000/api/auth/callback/duke`
- Production: `https://your-domain.com/api/auth/callback/duke`

### Issue: User Not Created in Supabase

**Solution**:
1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Verify the `users` table exists (run `supabase-schema.sql`)
3. Check server logs for Supabase errors

### Issue: "Access Denied" for Duke Students

**Solution**:
1. Check Duke's OIDC claims in the JWT callback (add console.log)
2. Verify the `eduPersonAffiliation` claim contains "student"
3. Adjust the `isStudent()` function in `src/lib/auth.ts` if needed

### Issue: Session Not Persisting

**Solution**:
1. Check that cookies are enabled in your browser
2. Verify `NEXTAUTH_URL` matches your current URL
3. In production, ensure `secure: true` is set for cookies (handled automatically)

### Issue: Duke Login Page Not Loading

**Solution**:
1. Verify `DUKE_OIDC_ISSUER` is correct
2. Check that your Duke application is approved and active
3. Ensure `DUKE_OIDC_CLIENT_ID` and `DUKE_OIDC_CLIENT_SECRET` are correct

---

## Testing Checklist

### Local Development
- [ ] Login page loads at `/login`
- [ ] "Sign in with Duke" button redirects to Duke SSO
- [ ] After Duke login, redirected back to `/courses`
- [ ] User record created in Supabase `users` table
- [ ] User menu displays correct name and NetID
- [ ] Logout works and clears session
- [ ] Protected routes redirect to login when not authenticated
- [ ] Student-only routes work for students
- [ ] Non-students see "Access Denied" page

### Production
- [ ] All local tests pass in production
- [ ] HTTPS is enabled
- [ ] Cookies are secure
- [ ] Environment variables are set correctly
- [ ] Duke redirect URI is configured for production domain

---

## Security Considerations

1. **Never commit `.env.local`** - It contains sensitive secrets
2. **Use HTTPS in production** - Required for secure cookies
3. **Rotate secrets regularly** - Especially `NEXTAUTH_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`
4. **Validate user input** - Even from authenticated users
5. **Use Row Level Security** - Supabase RLS policies protect data
6. **Monitor failed login attempts** - Set up logging and alerts
7. **Keep dependencies updated** - Regularly update NextAuth.js and other packages

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Duke OIT Authentication](https://oit.duke.edu/help/articles/kb0028318)
- [Supabase Documentation](https://supabase.com/docs)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [OpenID Connect Specification](https://openid.net/connect/)

---

## Support

For issues or questions:
1. Check this README first
2. Review NextAuth.js documentation
3. Contact Duke OIT for Duke SSO-specific issues
4. Check Supabase logs for database issues

---

**Last Updated**: November 2024

