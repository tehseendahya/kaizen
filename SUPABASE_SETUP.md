# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your Axis learning platform.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project with the database schema already set up (as provided in your SQL)

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key, not the `service_role` key)

## Step 2: Configure Environment Variables

Create or update your `.env.local` file in the root directory:

```env
# Google Gemini API Configuration (existing)
GOOGLE_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-lite

# Supabase Configuration (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** 
- The `NEXT_PUBLIC_` prefix makes these variables available to the browser
- Never commit `.env.local` to git (it's already in `.gitignore`)
- For production, add these variables to your hosting platform's environment settings

## Step 3: Verify Database Schema

Make sure your Supabase database has all the tables and functions from your SQL schema:

- ✅ `courses` table
- ✅ `units` table
- ✅ `subunits` table
- ✅ `profiles` table
- ✅ `user_progress` table
- ✅ `user_unit_progress` table
- ✅ `mark_subunit_started()` function
- ✅ `mark_subunit_finished()` function
- ✅ `check_unit_completion()` trigger
- ✅ Row Level Security (RLS) policies enabled

## Step 4: Configure Supabase Auth

1. In your Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/**` for development

3. For production, add your production URL:
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: Add `https://yourdomain.com/**`

## Step 5: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`
3. Create a test account
4. Verify:
   - ✅ You can sign up
   - ✅ Profile is created in the `profiles` table
   - ✅ You're redirected to `/courses` after signup
   - ✅ Navbar shows your username
   - ✅ You can sign out

## Step 6: Test Protected Routes

1. Sign out
2. Try to access `http://localhost:3000/courses`
3. You should be redirected to `/login`
4. Sign in and verify you can access protected routes

## Troubleshooting

### "Invalid API key" error
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure you're using the `anon` key, not the `service_role` key

### "Profile not found" error
- Check that the `profiles` table exists
- Verify RLS policies allow users to read their own profile
- Check the browser console for specific error messages

### Redirect loops
- Verify your middleware logic in `src/lib/supabase/middleware.ts`
- Check that your Supabase redirect URLs are configured correctly

### Authentication not persisting
- Check that cookies are being set (inspect browser DevTools → Application → Cookies)
- Verify your middleware is running (check Next.js server logs)

## Next Steps

Now that authentication is set up, you can:

1. **Integrate progress tracking**: Use the `markSubunitStarted()` and `markSubunitFinished()` functions from `src/lib/supabase/progress.ts` in your course pages

2. **Add profile editing**: Create a profile settings page where users can update their username, school, and year

3. **Sync user preferences**: Update `src/lib/user/prefs.ts` to optionally sync role and selected courses with the database

4. **Add email verification**: Configure Supabase to require email verification before allowing full access

5. **Add password reset**: Implement a "Forgot password" flow using Supabase's built-in password reset

## Security Notes

- ✅ RLS policies are already configured to protect user data
- ✅ All database functions use `SECURITY DEFINER` with `auth.uid()` checks
- ✅ Never expose your `service_role` key in client-side code
- ✅ The `anon` key is safe to use in the browser (it's restricted by RLS)

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add environment variables in your platform's settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_API_KEY` (existing)
   - `GEMINI_MODEL` (existing)

2. Update Supabase redirect URLs to include your production domain

3. Test authentication flow in production

4. Monitor Supabase dashboard for any authentication errors

