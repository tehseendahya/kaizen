-- ============================================================================
-- Fix subject_id Primary Key Issue
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the subject_id PK constraint
-- ============================================================================

-- Step 1: Check if subject_id is a primary key and handle it
DO $$
DECLARE
    pk_constraint_name TEXT;
BEGIN
    -- Find the primary key constraint name if subject_id is part of it
    SELECT conname INTO pk_constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.courses'::regclass
    AND contype = 'p'
    AND EXISTS (
        SELECT 1 FROM pg_attribute
        WHERE attrelid = conrelid
        AND attname = 'subject_id'
        AND attnum = ANY(conkey)
    );
    
    -- If subject_id is part of primary key, we need to drop it first
    IF pk_constraint_name IS NOT NULL THEN
        -- Drop the primary key constraint
        EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT ' || pk_constraint_name;
        RAISE NOTICE 'Dropped primary key constraint: %', pk_constraint_name;
        
        -- Now make subject_id nullable
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'subject_id'
        ) THEN
            ALTER TABLE public.courses 
            ALTER COLUMN subject_id DROP NOT NULL;
            RAISE NOTICE 'Made subject_id nullable';
        END IF;
        
        -- Add new id column as primary key if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'id'
        ) THEN
            ALTER TABLE public.courses 
            ADD COLUMN id UUID DEFAULT gen_random_uuid();
            
            UPDATE public.courses 
            SET id = gen_random_uuid() 
            WHERE id IS NULL;
            
            ALTER TABLE public.courses 
            ALTER COLUMN id SET NOT NULL;
            
            ALTER TABLE public.courses 
            ADD PRIMARY KEY (id);
            
            RAISE NOTICE 'Created new id primary key';
        END IF;
    ELSE
        -- subject_id is not part of PK, just make it nullable
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'subject_id'
        ) THEN
            ALTER TABLE public.courses 
            ALTER COLUMN subject_id DROP NOT NULL;
            RAISE NOTICE 'Made subject_id nullable';
        END IF;
    END IF;
END $$;

-- Step 2: Ensure code and title columns exist
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
        
        UPDATE public.courses 
        SET code = 'UNKNOWN' 
        WHERE code IS NULL;
        
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
        
        UPDATE public.courses 
        SET title = 'Untitled Course' 
        WHERE title IS NULL;
        
        ALTER TABLE public.courses 
        ALTER COLUMN title SET NOT NULL;
    END IF;
END $$;

-- Step 3: Ensure id column exists as primary key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'id'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN id UUID DEFAULT gen_random_uuid();
        
        UPDATE public.courses 
        SET id = gen_random_uuid() 
        WHERE id IS NULL;
        
        ALTER TABLE public.courses 
        ALTER COLUMN id SET NOT NULL;
        
        -- Add primary key if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'public.courses'::regclass 
            AND contype = 'p'
        ) THEN
            ALTER TABLE public.courses 
            ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- Step 4: Ensure other required columns exist
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
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now() NOT NULL;
    END IF;
END $$;

-- ============================================================================
-- END OF FIX
-- ============================================================================

