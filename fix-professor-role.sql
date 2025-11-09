-- Fix professor role if it was accidentally changed to student
-- Replace 'YOUR_USER_ID' with your actual user ID (from auth.users table)
-- Or replace 'YOUR_EMAIL' with your email address

-- Option 1: Fix by user ID
-- UPDATE public.profiles 
-- SET role = 'professor' 
-- WHERE id = 'YOUR_USER_ID'::uuid;

-- Option 2: Fix by email (if you know your email)
-- UPDATE public.profiles 
-- SET role = 'professor' 
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL'
-- );

-- Option 3: List all profiles to find your user ID
-- SELECT p.id, p.username, p.role, u.email 
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- ORDER BY p.created_at DESC;

-- Option 4: Fix all users with a specific email pattern (e.g., @university.edu professors)
-- UPDATE public.profiles 
-- SET role = 'professor' 
-- WHERE id IN (
--   SELECT id FROM auth.users 
--   WHERE email LIKE '%@university.edu'
-- ) AND role = 'student';

-- After running the update, verify the change:
-- SELECT p.id, p.username, p.role, u.email 
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE p.role = 'professor';

