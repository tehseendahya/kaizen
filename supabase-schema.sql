-- =============================================================================
-- AXIS LEARNING PLATFORM - SUPABASE DATABASE SCHEMA
-- =============================================================================
-- Run this SQL in your Supabase SQL Editor to create the users table

-- Create users table for Duke SSO authentication
CREATE TABLE IF NOT EXISTS public.users (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Duke NetID (unique identifier from Duke SSO)
  duke_netid TEXT UNIQUE NOT NULL,
  
  -- User information from Duke OIDC
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  
  -- Duke affiliation (student, faculty, staff, etc.)
  affiliation TEXT,
  
  -- Additional Duke attributes (stored as JSONB for flexibility)
  duke_attributes JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on duke_netid for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_duke_netid ON public.users(duke_netid);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (true); -- Allow all authenticated users to read (you can restrict this further)

-- Policy: Service role can do everything (for NextAuth callbacks)
CREATE POLICY "Service role has full access"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- OPTIONAL: Course progress tracking table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  unit_id TEXT,
  subunit_id TEXT,
  completed BOOLEAN DEFAULT FALSE,
  progress_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one progress record per user per subunit
  UNIQUE(user_id, course_id, unit_id, subunit_id)
);

CREATE INDEX IF NOT EXISTS idx_course_progress_user ON public.course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course ON public.course_progress(course_id);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read/write their own progress
CREATE POLICY "Users can manage own progress"
  ON public.course_progress
  FOR ALL
  USING (auth.uid()::text = user_id::text);

