-- Quick fix for "null value in column full_name" error
-- Run this in Supabase SQL Editor

-- Step 1: Make full_name nullable (if it exists)
ALTER TABLE public.courses 
ALTER COLUMN full_name DROP NOT NULL;

-- Step 2: Add title column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN title TEXT;
        
        -- Copy data from full_name to title
        UPDATE public.courses 
        SET title = COALESCE(full_name, code, 'Untitled Course')
        WHERE title IS NULL;
        
        -- Make title NOT NULL
        ALTER TABLE public.courses ALTER COLUMN title SET NOT NULL;
    END IF;
END $$;

-- Step 3: Ensure code column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'code'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN code TEXT;
        
        -- Migrate from subject_id if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'subject_id'
        ) THEN
            UPDATE public.courses 
            SET code = subject_id 
            WHERE code IS NULL AND subject_id IS NOT NULL;
        END IF;
        
        -- Set default if still null
        UPDATE public.courses 
        SET code = 'COURSE-' || id::text
        WHERE code IS NULL;
        
        -- Make code NOT NULL
        ALTER TABLE public.courses ALTER COLUMN code SET NOT NULL;
    END IF;
END $$;

-- Step 4: Ensure created_by exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 5: Ensure is_published exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Step 6: Drop full_name column (optional - comment out if you want to keep it)
-- ALTER TABLE public.courses DROP COLUMN IF EXISTS full_name;

