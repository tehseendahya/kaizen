-- ============================================================================
-- Fix subject_id NOT NULL Constraint Error
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the subject_id constraint issue
-- ============================================================================

-- Step 1: Make subject_id nullable if it exists (for backward compatibility)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'subject_id'
    ) THEN
        -- Make it nullable
        ALTER TABLE public.courses 
        ALTER COLUMN subject_id DROP NOT NULL;
        
        RAISE NOTICE 'Made subject_id nullable';
    END IF;
END $$;

-- Step 2: Ensure code and title columns exist and are NOT NULL
DO $$
BEGIN
    -- Add code if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'code'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN code TEXT;
        
        -- Migrate from subject_id if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'subject_id'
        ) THEN
            UPDATE public.courses 
            SET code = subject_id 
            WHERE code IS NULL;
        END IF;
        
        ALTER TABLE public.courses 
        ALTER COLUMN code SET NOT NULL;
    END IF;
    
    -- Add title if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN title TEXT;
        
        -- Migrate from full_name if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'full_name'
        ) THEN
            UPDATE public.courses 
            SET title = full_name 
            WHERE title IS NULL;
        END IF;
        
        -- Set default if still null
        UPDATE public.courses 
        SET title = 'Untitled Course' 
        WHERE title IS NULL;
        
        ALTER TABLE public.courses 
        ALTER COLUMN title SET NOT NULL;
    END IF;
END $$;

-- Step 3: Remove subject_id NOT NULL constraint if it still exists
-- (We'll keep the column for backward compatibility but make it optional)
DO $$
BEGIN
    -- Check if there's a NOT NULL constraint on subject_id
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name = 'courses'
        AND ccu.column_name = 'subject_id'
        AND tc.constraint_type = 'CHECK'
    ) THEN
        -- Try to drop any check constraints
        DECLARE
            constraint_name TEXT;
        BEGIN
            FOR constraint_name IN
                SELECT conname 
                FROM pg_constraint 
                WHERE conrelid = 'public.courses'::regclass
                AND contype = 'c'
            LOOP
                EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS ' || constraint_name;
            END LOOP;
        END;
    END IF;
END $$;

-- Step 4: Ensure the courses table has the correct structure
-- This will create it if it doesn't exist, but won't modify if it does
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- END OF FIX
-- ============================================================================

