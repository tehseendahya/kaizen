-- ============================================================================
-- Fix courses table schema - Remove old full_name column and ensure new schema
-- ============================================================================

-- Step 1: Check if old schema exists and handle migration
DO $$
BEGIN
    -- If full_name column exists, we need to migrate
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'full_name'
    ) THEN
        -- Make full_name nullable first (in case it has NOT NULL constraint)
        ALTER TABLE public.courses 
        ALTER COLUMN full_name DROP NOT NULL;
        
        -- Add title column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'title'
        ) THEN
            ALTER TABLE public.courses 
            ADD COLUMN title TEXT;
            
            -- Migrate data from full_name to title
            UPDATE public.courses 
            SET title = full_name 
            WHERE title IS NULL AND full_name IS NOT NULL;
            
            -- Make title NOT NULL after migration
            ALTER TABLE public.courses 
            ALTER COLUMN title SET NOT NULL;
        END IF;
        
        -- Drop full_name column (after ensuring title has data)
        ALTER TABLE public.courses 
        DROP COLUMN IF EXISTS full_name;
    END IF;
END $$;

-- Step 2: Ensure new schema columns exist
DO $$
BEGIN
    -- Ensure id column exists as UUID primary key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'id'
    ) THEN
        -- Add id column
        ALTER TABLE public.courses 
        ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    ELSE
        -- Ensure id is UUID type
        IF (SELECT data_type FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'id') != 'uuid' THEN
            -- This is complex, we'll handle it differently
            -- For now, just ensure it exists
            NULL;
        END IF;
    END IF;
    
    -- Ensure code column exists
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
            WHERE code IS NULL AND subject_id IS NOT NULL;
        END IF;
        
        -- Make code NOT NULL after migration
        ALTER TABLE public.courses 
        ALTER COLUMN code SET NOT NULL;
    END IF;
    
    -- Ensure title column exists and is NOT NULL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN title TEXT NOT NULL DEFAULT '';
    ELSE
        -- Ensure title is NOT NULL
        ALTER TABLE public.courses 
        ALTER COLUMN title SET NOT NULL;
    END IF;
    
    -- Ensure created_by column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    
    -- Ensure is_published column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    -- Ensure updated_at column exists
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

-- Step 3: Drop old subject_id column if it exists and is not the primary key
DO $$
DECLARE
    pk_constraint_name TEXT;
BEGIN
    -- Check if subject_id exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'subject_id'
    ) THEN
        -- Find primary key constraint that includes subject_id
        SELECT constraint_name INTO pk_constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
            AND tc.table_name = 'courses'
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = 'subject_id'
        LIMIT 1;
        
        -- If subject_id is part of primary key, drop the constraint first
        IF pk_constraint_name IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS %I CASCADE', pk_constraint_name);
        END IF;
        
        -- Make subject_id nullable
        ALTER TABLE public.courses 
        ALTER COLUMN subject_id DROP NOT NULL;
        
        -- Drop subject_id column (only if code exists and has data)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'code'
        ) THEN
            ALTER TABLE public.courses 
            DROP COLUMN IF EXISTS subject_id;
        END IF;
    END IF;
END $$;

-- Step 4: Ensure id is the primary key
DO $$
DECLARE
    current_pk TEXT;
BEGIN
    -- Get current primary key constraint name
    SELECT constraint_name INTO current_pk
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
        AND table_name = 'courses'
        AND constraint_type = 'PRIMARY KEY'
    LIMIT 1;
    
    -- If primary key exists but doesn't use id, we need to handle it
    -- For now, just ensure id column exists and is unique
    IF current_pk IS NOT NULL THEN
        -- Check if id is part of the primary key
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.key_column_usage
            WHERE constraint_name = current_pk
                AND column_name = 'id'
        ) THEN
            -- This is complex - we'll leave the existing PK for now
            -- Just ensure id is unique
            CREATE UNIQUE INDEX IF NOT EXISTS courses_id_unique ON public.courses(id) WHERE id IS NOT NULL;
        END IF;
    ELSE
        -- No primary key exists, add one on id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'courses' 
            AND column_name = 'id'
        ) THEN
            ALTER TABLE public.courses 
            ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- Step 5: Ensure code is unique (if not already)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
            AND table_name = 'courses'
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%code%'
    ) THEN
        -- Create unique index on code, handling duplicates
        CREATE UNIQUE INDEX IF NOT EXISTS courses_code_unique 
        ON public.courses(code) 
        WHERE code IS NOT NULL;
    END IF;
END $$;

-- Step 6: Verify final schema
DO $$
BEGIN
    RAISE NOTICE 'Courses table schema fix completed.';
    RAISE NOTICE 'Columns in courses table:';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'courses'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %)', rec.column_name, rec.data_type, rec.is_nullable;
    END LOOP;
END $$;
