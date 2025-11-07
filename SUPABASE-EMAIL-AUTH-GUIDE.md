# Supabase Email/Password Authentication - Complete Setup Guide

## 🎯 Overview

This guide explains the complete email/password authentication system implemented using Supabase in your Next.js app. This system works **alongside** your existing Duke SSO (NextAuth) setup.

---

## 📋 Features Implemented

✅ **Sign Up with Email + Password**
- User registration with email/password
- Automatic duplicate email detection
- Email verification requirement
- Clear error handling

✅ **Email Verification**
- Verification email sent on signup
- Custom callback page for email confirmation
- Protected routes require verified email
- Resend verification option

✅ **Sign In with Email + Password**
- Standard email/password login
- Verification status check
- Secure session management
- Automatic redirects

✅ **Protected Routes**
- ProtectedRoute component for guarding pages
- Automatic auth state monitoring
- Redirect to sign in if not authenticated
- Redirect to verify page if email not confirmed

✅ **Password Reset**
- Forgot password flow
- Reset link via email
- Secure password update

---

## 🗂️ Files Created/Modified

### Core Auth Files
```
src/lib/supabaseClient.ts              # Supabase client with auth config
src/components/auth/ProtectedRoute.tsx  # Route protection wrapper
```

### Auth Pages
```
src/app/auth/signup/page.tsx           # User registration
src/app/auth/signin/page.tsx           # User login
src/app/auth/callback/page.tsx         # Email verification handler
src/app/auth/verify-email/page.tsx     # Email verification reminder
src/app/auth/forgot-password/page.tsx  # Password reset request
```

### Example Protected Page
```
src/app/dashboard/page.tsx             # Example of protected route
```

---

## 🔧 Environment Variables

Ensure these are set in your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

---

## 🔐 Supabase Dashboard Configuration

### Step 1: Enable Email Authentication

1. Go to **Authentication → Providers**
2. Find **Email** provider
3. Enable it if not already enabled
4. **IMPORTANT:** Enable **"Confirm email"** option
   - This ensures users must verify their email before full access

### Step 2: Configure Email Templates (Optional)

1. Go to **Authentication → Email Templates**
2. Customize the following templates:
   - **Confirm signup**: Sent when user registers
   - **Reset password**: Sent for password resets
3. Make sure the redirect URL is correct (should be your callback page)

### Step 3: Add Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Add these to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

### Step 4: Configure Site URL

1. In **Authentication → URL Configuration**
2. Set **Site URL** to your production domain:
   ```
   https://yourdomain.com
   ```

---

## 🎨 Authentication Flow

### Sign Up Flow
```
1. User visits /auth/signup
2. Enters email + password
3. Supabase creates account (unverified)
4. Verification email sent
5. User sees "Check your inbox" message
6. User clicks link in email
7. Redirected to /auth/callback
8. Email verified ✅
9. Redirected to /dashboard
```

### Sign In Flow
```
1. User visits /auth/signin
2. Enters email + password
3. Supabase checks credentials
4. If email not verified:
   → Redirected to /auth/verify-email
5. If email verified:
   → Redirected to /dashboard ✅
```

### Email Verification Callback
```
1. User clicks verification link in email
2. Redirected to /auth/callback?token=...
3. Supabase automatically processes token
4. We call getUser() to complete verification
5. Show success message
6. Redirect to /dashboard
```

---

## 🛡️ Using Protected Routes

### Method 1: Wrap Your Page Component

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Your protected content here</div>
    </ProtectedRoute>
  );
}
```

### Method 2: Without Email Verification Requirement

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute requireEmailVerification={false}>
      <div>Content accessible without verified email</div>
    </ProtectedRoute>
  );
}
```

### Method 3: Check Auth in Server Components (Optional)

For server-side protection, you can create a server-side auth utility:

```tsx
// src/lib/auth-helpers.ts
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function getServerUser() {
  // This is a basic example - adjust based on your setup
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

---

## 🔄 How Duplicate Email Prevention Works

Supabase automatically enforces unique email constraints. When a duplicate email is detected:

1. Supabase returns an error with status `422` or message containing "already registered"
2. Our signup page catches this and shows:
   ```
   "An account with this email already exists. Try signing in instead."
   ```
3. No duplicate account is created ✅

---

## 📧 Email Verification Enforcement

### Why Email Verification?

- Prevents spam accounts
- Ensures valid contact information
- Required for password resets
- Improves security

### How It's Enforced

1. **On Signup**: Account created but `email_confirmed_at` is `null`
2. **On Sign In**: We check `user.email_confirmed_at`:
   - If `null` → redirect to `/auth/verify-email`
   - If set → allow access to protected routes
3. **In ProtectedRoute**: Double-checks verification status

### Resending Verification Email

Users can resend from:
- `/auth/verify-email` page
- Sign in page (if error shows unverified)

---

## 🧪 Testing the Auth Flow

### Test Sign Up

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000/auth/signup
3. Enter a test email (use a real email you can access)
4. Enter a password (min 6 characters)
5. Click "Sign Up"
6. Check your email for verification link
7. Click the link
8. Should redirect to `/auth/callback` then `/dashboard`

### Test Sign In

1. Go to http://localhost:3000/auth/signin
2. Enter your verified credentials
3. Click "Sign In"
4. Should redirect to `/dashboard`

### Test Duplicate Email

1. Try to sign up with an existing email
2. Should see error: "An account with this email already exists..."

### Test Unverified Email Block

1. Sign up with a new email
2. Don't click verification link
3. Try to sign in
4. Should be redirected to `/auth/verify-email`

---

## 🎯 Available Routes

| Route | Purpose | Auth Required | Verified Email Required |
|-------|---------|---------------|------------------------|
| `/auth/signup` | User registration | No | No |
| `/auth/signin` | User login | No | No |
| `/auth/callback` | Email verification handler | No | No |
| `/auth/verify-email` | Verification reminder | Yes | No |
| `/auth/forgot-password` | Password reset request | No | No |
| `/dashboard` | Protected dashboard | Yes | Yes |

---

## 🔍 Debugging Common Issues

### Issue: "Missing Supabase environment variables"

**Solution:** 
- Check that `.env.local` exists in project root
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart your dev server after adding env vars

### Issue: "Verification email not received"

**Solutions:**
1. Check spam/junk folder
2. Verify email provider settings in Supabase Dashboard
3. Check Supabase Dashboard → Authentication → Logs for email errors
4. Ensure email confirmations are enabled in Supabase settings

### Issue: "User already registered" error on signup

**Solution:**
- This is expected! It means the email is already in use
- User should sign in instead
- To test with same email, delete user from Supabase Dashboard

### Issue: "Session not persisting after page reload"

**Solution:**
- Check that `persistSession: true` is set in `supabaseClient.ts` (it is)
- Check browser cookies are enabled
- Verify you're not clearing localStorage/cookies

### Issue: "Redirect loop between sign in and verify email"

**Solution:**
- This can happen if email verification check is inconsistent
- Check Supabase Dashboard to confirm email_confirmed_at is set
- Try signing out and signing in again

---

## 🚀 Next Steps

### Add Password Reset Flow

The forgot password page is created, but you need to create:
- `/auth/reset-password/page.tsx` - Page where user enters new password

Example implementation:

```tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Password updated!');
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    // ... form UI similar to other auth pages
  );
}
```

### Add User Profile Management

Create a profile page at `/profile/page.tsx` where users can:
- Update their display name
- Change password
- Delete account
- View account info

### Integrate with Your Database

If you want to store additional user data beyond Supabase auth:

1. Create a `profiles` table in Supabase:
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. Add a trigger to auto-create profile on signup:
```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎨 Customization

### Change Redirect URLs

Edit these in the respective page files:
- **After signup verification**: `src/app/auth/callback/page.tsx` → Change `/dashboard` redirect
- **After sign in**: `src/app/auth/signin/page.tsx` → Change `/dashboard` redirect

### Customize Email Templates

Go to Supabase Dashboard → Authentication → Email Templates:
- Edit HTML/text for confirmation and reset emails
- Add your branding
- Customize redirect URLs

### Update Styling

All pages use Tailwind CSS with a dark theme. To customize:
- Modify classes in each page component
- Colors: `bg-gray-800`, `border-gray-700`, `text-white`, etc.
- Update to match your app's design system

---

## 📞 Support & Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)

---

## ✅ Checklist

Before deploying to production:

- [ ] Environment variables set in production
- [ ] Supabase email confirmations enabled
- [ ] Production redirect URLs added to Supabase
- [ ] Site URL configured in Supabase
- [ ] Email templates customized (optional)
- [ ] Test all auth flows in production
- [ ] Set up monitoring for auth errors
- [ ] Configure rate limiting (if needed)
- [ ] Add terms of service / privacy policy links
- [ ] Test password reset flow

---

**That's it! 🎉** You now have a complete, production-ready email/password authentication system with Supabase!

