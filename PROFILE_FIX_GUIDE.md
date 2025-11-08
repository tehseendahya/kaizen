# Profile Creation Fix Guide

## What Was Fixed

I've updated the login and signup flows to handle profile creation more reliably:

1. **Login Page**: Now automatically creates a profile if one doesn't exist when you log in
2. **Signup Page**: Uses multiple fallback methods to ensure profile creation
3. **API Route**: Created `/api/profile/ensure` for server-side profile creation (avoids RLS timing issues)
4. **Database Trigger**: SQL script provided to auto-create profiles as a backup

## Quick Fix Steps

### Option 1: Add Database Trigger (Recommended - Most Reliable)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database-trigger-profile.sql`
4. Click **Run**
5. This will automatically create profiles for all new users

**This is the most reliable solution** - even if client-side code fails, the database will create the profile automatically.

### Option 2: Verify RLS Policies

Make sure your RLS policy allows users to insert their own profile:

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Find the `profiles` table
3. Verify you have a policy like:

```sql
CREATE POLICY "Users can insert and update their own profile"
ON public.profiles
FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

If this policy doesn't exist, create it in the SQL Editor.

### Option 3: Test the Updated Code

The code now has multiple fallbacks:

1. **Direct Insert**: Tries to create profile directly (fastest)
2. **API Route**: Falls back to server-side creation if direct fails
3. **Database Trigger**: Final backup if both fail

## Testing the Fix

### Test Signup:

1. Go to `/signup`
2. Create a new account with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123456`
3. **Expected Result**:
   - ✅ Account created
   - ✅ Profile created in database
   - ✅ Redirected to `/courses`
   - ✅ No errors in console

### Test Login:

1. Go to `/login`
2. Sign in with your account
3. **Expected Result**:
   - ✅ Successfully logged in
   - ✅ Profile exists (or is created automatically)
   - ✅ Redirected to `/courses`
   - ✅ Navbar shows your username

### Verify in Database:

1. Go to Supabase Dashboard → **Table Editor** → `profiles`
2. You should see your profile with:
   - `id` matching your auth user ID
   - `username` matching what you entered
   - `created_at` timestamp

## Troubleshooting

### Still Getting "Profile creation error"?

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for the actual error message
   - The error will tell you what's wrong

2. **Common Issues**:

   **"new row violates row-level security policy"**
   - Solution: Add the database trigger (Option 1 above)
   - Or verify RLS policies allow INSERT

   **"duplicate key value violates unique constraint"**
   - This means profile already exists - this is OK!
   - The code handles this gracefully

   **"relation 'profiles' does not exist"**
   - Your `profiles` table doesn't exist
   - Run your original SQL schema to create it

3. **Check Supabase Logs**:
   - Go to Supabase Dashboard → **Logs** → **API Logs**
   - Look for errors related to profile creation

### Profile Not Showing in Navbar?

1. Check browser console for errors
2. Verify profile exists in database
3. Try signing out and back in
4. Clear browser cache and cookies

## What Changed in the Code

### Login (`src/app/login/page.tsx`):
- Now calls `/api/profile/ensure` after successful login
- Automatically creates profile if missing
- Non-blocking (continues even if profile creation fails)

### Signup (`src/app/signup/page.tsx`):
- Tries direct insert first (fastest)
- Falls back to API route if direct fails
- Shows helpful error messages
- Doesn't block account creation

### New API Route (`src/app/api/profile/ensure/route.ts`):
- Server-side profile creation
- Bypasses some RLS timing issues
- Returns detailed error messages

## Next Steps

1. **Add the database trigger** (most reliable)
2. **Test signup** with a new account
3. **Test login** with existing account
4. **Verify profile** appears in database
5. **Check navbar** shows username

If you're still having issues after trying these steps, check the browser console for the specific error message and we can debug further!

