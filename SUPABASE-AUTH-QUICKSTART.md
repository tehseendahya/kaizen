# Supabase Email/Password Auth - Quick Start

## ⚡ 5-Minute Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Dashboard Setup

1. Go to **Authentication → Providers → Email**
2. ✅ Enable Email provider
3. ✅ Enable "Confirm email" option
4. Go to **Authentication → URL Configuration**
5. Add redirect URL: `http://localhost:3000/auth/callback`

### 3. Test It

```bash
npm run dev
```

Visit: http://localhost:3000/auth/signup

---

## 🗺️ Available Routes

| URL | Purpose |
|-----|---------|
| `/auth/signup` | Create account |
| `/auth/signin` | Login |
| `/auth/callback` | Email verification handler (auto) |
| `/auth/verify-email` | Resend verification |
| `/auth/forgot-password` | Request password reset |
| `/auth/reset-password` | Set new password |
| `/dashboard` | Protected page example |

---

## 🛡️ Protect a Route

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

---

## 🔑 Auth Functions

### Get Current User

```tsx
import { supabase } from '@/lib/supabaseClient';

const { data: { user } } = await supabase.auth.getUser();
```

### Sign Out

```tsx
await supabase.auth.signOut();
```

### Check Auth State

```tsx
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

---

## 🎯 Auth Flow Summary

### Sign Up
1. User fills form at `/auth/signup`
2. Account created (unverified)
3. Verification email sent
4. User clicks link → `/auth/callback`
5. Email verified → redirect to `/dashboard`

### Sign In
1. User fills form at `/auth/signin`
2. Credentials validated
3. Email verification checked
4. If verified → `/dashboard`
5. If not → `/auth/verify-email`

---

## 🐛 Common Issues

**Verification email not arriving?**
- Check spam folder
- Verify "Confirm email" is enabled in Supabase
- Check Authentication → Logs in Supabase Dashboard

**"User already registered" error?**
- Expected! Email already in use
- User should sign in instead

**Session not persisting?**
- Check browser cookies enabled
- Restart dev server after env var changes

---

## 📚 Full Documentation

See `SUPABASE-EMAIL-AUTH-GUIDE.md` for complete details.

---

## ✅ Pre-Deploy Checklist

- [ ] Env vars set in production
- [ ] Production URL added to Supabase redirect URLs
- [ ] Email confirmations enabled
- [ ] Test all flows in production
- [ ] Customize email templates (optional)

---

**Need help?** Check the full guide or [Supabase Docs](https://supabase.com/docs/guides/auth).

