-- Database Trigger to Automatically Create Profiles
-- Run this in your Supabase SQL Editor to ensure profiles are always created

-- This trigger automatically creates a profile when a new user signs up
-- It's a backup in case the client-side profile creation fails

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
      'student'  -- Default to student if not specified
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    username = COALESCE(EXCLUDED.username, profiles.username),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (to avoid errors on re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

