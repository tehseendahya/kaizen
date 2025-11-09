-- Remove unique constraint on course code
-- This allows multiple courses with the same code (e.g., different terms, professors)
-- Run this in Supabase SQL Editor

-- Drop the unique constraint/index on course code
DROP INDEX IF EXISTS courses_code_unique;

-- Verify it's removed
SELECT 'Unique constraint on course code removed!' as status;

-- Show remaining constraints on courses table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'courses'
ORDER BY tc.constraint_type, kcu.column_name;

