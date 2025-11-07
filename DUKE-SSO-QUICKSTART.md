# Duke SSO Quick Start Guide

## 🚀 Get Duke Authentication Running in 5 Minutes

### Step 1: Update `.env.local`

Add these new variables to your `.env.local` file:

```bash
# Generate this secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Your app URL
NEXTAUTH_URL=http://localhost:3000

# Supabase service role key (get from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Duke SSO credentials (get from Duke Authentication Manager)
DUKE_OIDC_ISSUER=https://shib.oit.duke.edu/idp/profile/oidc
DUKE_OIDC_CLIENT_ID=your_duke_client_id_here
DUKE_OIDC_CLIENT_SECRET=your_duke_client_secret_here
```

### Step 2: Run Database Migration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open SQL Editor
3. Copy and run the SQL from `supabase-schema.sql`

### Step 3: Register with Duke

1. Go to [Duke Authentication Manager](https://oit.duke.edu/help/articles/kb0028318)
2. Register a new application
3. Set redirect URI to: `http://localhost:3000/api/auth/callback/duke`
4. Copy your Client ID and Client Secret to `.env.local`

### Step 4: Restart Dev Server

```bash
# Kill existing server
pkill -f "next"

# Start fresh
npm run dev
```

### Step 5: Test Login

1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with Duke NetID"
3. Log in with your Duke credentials
4. You should be redirected to `/courses`

## ✅ Verification

- [ ] Login page loads
- [ ] Duke SSO redirect works
- [ ] User created in Supabase `users` table
- [ ] User menu shows your name
- [ ] Logout works

## 🔧 Troubleshooting

**Error: "Invalid supabaseUrl"**
→ Check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

**Error: "NEXTAUTH_SECRET is not set"**
→ Run `openssl rand -base64 32` and add to `.env.local`

**Error: "Redirect URI mismatch"**
→ Ensure Duke redirect URI exactly matches: `http://localhost:3000/api/auth/callback/duke`

**User not created in Supabase**
→ Check `SUPABASE_SERVICE_ROLE_KEY` is correct

## 📚 Full Documentation

See `AUTH-README.md` for complete documentation.

## 🎯 What's Configured

✅ NextAuth.js with Duke OIDC provider
✅ Supabase user database
✅ Protected routes (courses require Duke student login)
✅ User menu with logout
✅ Session management with secure cookies
✅ Gary the Penguin integration with user names

## 🔐 Important Redirect URIs

**Local Development:**
```
http://localhost:3000/api/auth/callback/duke
```

**Production (when deploying):**
```
https://your-domain.com/api/auth/callback/duke
```

Remember to update Duke Authentication Manager with your production URL!

