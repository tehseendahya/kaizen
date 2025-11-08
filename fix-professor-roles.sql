-- Fix Professor Roles Script
-- Run this in Supabase SQL Editor to:
-- 1. Update the database trigger to handle roles
-- 2. Fix any existing profiles that might have incorrect roles

-- ============================================================================
-- 1. UPDATE TRIGGER TO HANDLE ROLE FROM METADATA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role',
      'student'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    username = COALESCE(EXCLUDED.username, profiles.username),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. VERIFY ALL PROFILES HAVE ROLES
-- ============================================================================

-- Check for profiles without roles
SELECT id, username, role 
FROM public.profiles 
WHERE role IS NULL;

-- Update any NULL roles to 'student' (if any exist)
UPDATE public.profiles 
SET role = 'student' 
WHERE role IS NULL;

-- ============================================================================
-- 3. MANUAL ROLE UPDATE (if needed)
-- ============================================================================

-- To manually set a user as professor, run:
-- UPDATE public.profiles 
-- SET role = 'professor' 
-- WHERE id = 'user-id-here';

-- To check a user's current role:
-- SELECT id, username, role, email 
-- FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE u.email = 'your-email@example.com';

