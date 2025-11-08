-- ============================================================================
-- COMPLETE AXIS DATABASE SCHEMA - INCLUDING COURSE CONTENT SYSTEM
-- ============================================================================
-- Run this entire script in Supabase SQL Editor
-- It's idempotent - safe to run multiple times
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 1: PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    school TEXT,
    year INT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT DEFAULT 'student';
        
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('student', 'professor', 'admin'));
        
        ALTER TABLE public.profiles 
        ALTER COLUMN role SET NOT NULL;
        
        UPDATE public.profiles 
        SET role = 'student' 
        WHERE role IS NULL;
    END IF;
END $$;

-- ============================================================================
-- PART 2: COURSES TABLE - HANDLES OLD PRIMARY KEY AND DEPENDENCIES
-- ============================================================================

-- Step 1: Drop dependent foreign keys first
DO $$
DECLARE
    fk_constraint RECORD;
BEGIN
    -- Drop all foreign keys that reference courses
    FOR fk_constraint IN
        SELECT conname, conrelid::regclass::text as table_name
        FROM pg_constraint
        WHERE confrelid = 'public.courses'::regclass
        AND contype = 'f'
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE ' || fk_constraint.table_name || 
                    ' DROP CONSTRAINT IF EXISTS ' || fk_constraint.conname || ' CASCADE';
            RAISE NOTICE 'Dropped foreign key: % on table %', fk_constraint.conname, fk_constraint.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop constraint %: %', fk_constraint.conname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 2: Drop old primary key if subject_id is part of it
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
    
    -- If subject_id is part of primary key, drop it
    IF pk_constraint_name IS NOT NULL THEN
        BEGIN
            EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS ' || pk_constraint_name || ' CASCADE';
            RAISE NOTICE 'Dropped primary key constraint: %', pk_constraint_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop PK: %', SQLERRM;
        END;
    END IF;
END $$;

-- Step 3: Create courses table with new schema (if it doesn't exist)
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

-- Step 4: Make subject_id nullable if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'subject_id'
    ) THEN
        BEGIN
            ALTER TABLE public.courses 
            ALTER COLUMN subject_id DROP NOT NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop NOT NULL from subject_id: %', SQLERRM;
        END;
    END IF;
END $$;

-- Step 5: Ensure id column exists as primary key
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

-- Step 6: Ensure code column exists and is UNIQUE
DO $$
BEGIN
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
    
    -- Make code unique (required for foreign key references)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.courses'::regclass 
        AND contype = 'u'
        AND EXISTS (
            SELECT 1 FROM pg_attribute
            WHERE attrelid = conrelid
            AND attname = 'code'
            AND attnum = ANY(conkey)
        )
    ) THEN
        -- Handle any duplicate codes first
        UPDATE public.courses c1
        SET code = code || '_' || substring(c1.id::text, 1, 8)
        WHERE EXISTS (
            SELECT 1 FROM public.courses c2
            WHERE c2.code = c1.code
            AND c2.id != c1.id
        );
        
        ALTER TABLE public.courses 
        ADD CONSTRAINT courses_code_unique UNIQUE (code);
    END IF;
END $$;

-- Step 7: Ensure title column exists
DO $$
BEGIN
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

-- Step 8: Ensure other required columns exist
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
    
    -- Add status column (for course content system)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.courses 
        ADD COLUMN status TEXT DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'READY_FOR_REVIEW', 'PUBLISHED'));
        
        -- Set status based on is_published
        UPDATE public.courses 
        SET status = CASE 
            WHEN is_published = true THEN 'PUBLISHED'
            ELSE 'DRAFT'
        END;
        
        ALTER TABLE public.courses 
        ALTER COLUMN status SET NOT NULL;
    END IF;
    
    -- Add term column (for course content system)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'term'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN term TEXT;
    END IF;
END $$;

-- ============================================================================
-- PART 3: COURSE CONTENT SYSTEM TABLES (NEW)
-- ============================================================================

-- Course Drafts Table
CREATE TABLE IF NOT EXISTS public.course_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  schema_version TEXT NOT NULL DEFAULT 'v1',
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT course_drafts_unique_course UNIQUE (course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_drafts_course_id ON public.course_drafts(course_id);

-- Course Published Table
CREATE TABLE IF NOT EXISTS public.course_published (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID UNIQUE NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  schema_version TEXT NOT NULL DEFAULT 'v1',
  content JSONB NOT NULL,
  published_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_published_course_id ON public.course_published(course_id);

-- Course Uploads Table
CREATE TABLE IF NOT EXISTS public.course_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_id UUID REFERENCES public.ingestions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  parsed_text TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_uploads_course_id ON public.course_uploads(course_id);
CREATE INDEX IF NOT EXISTS idx_course_uploads_ingestion_id ON public.course_uploads(ingestion_id);

-- ============================================================================
-- PART 4: LEGACY TABLES (for backward compatibility)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.units (
    id INT NOT NULL,
    subject_id TEXT,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (subject_id, id)
);

-- Add foreign key to courses.code (now that code is UNIQUE)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'code'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE public.units 
        DROP CONSTRAINT IF EXISTS units_subject_id_fkey CASCADE;
        
        -- Recreate with correct reference
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'units_subject_id_fkey'
        ) THEN
            ALTER TABLE public.units 
            ADD CONSTRAINT units_subject_id_fkey 
            FOREIGN KEY (subject_id) 
            REFERENCES public.courses(code) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.subunits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id TEXT NOT NULL,
    unit_id INT NOT NULL,
    sub_unit_id TEXT NOT NULL,
    title TEXT NOT NULL,
    abbreviations TEXT,
    intuition TEXT,
    code_sketch TEXT,
    visual_model TEXT,
    pitfalls TEXT,
    vocabulary TEXT,
    recap TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT subunits_unique_per_unit UNIQUE (subject_id, unit_id, sub_unit_id)
);

-- Add foreign key constraint for subunits if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subunits_subject_id_unit_id_fkey'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'units'
        ) THEN
            ALTER TABLE public.subunits 
            ADD CONSTRAINT subunits_subject_id_unit_id_fkey 
            FOREIGN KEY (subject_id, unit_id) 
            REFERENCES public.units(subject_id, id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL,
    unit_id INT NOT NULL,
    sub_unit_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, subject_id, sub_unit_id)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_progress_unit_fk'
    ) THEN
        ALTER TABLE public.user_progress 
        ADD CONSTRAINT user_progress_unit_fk 
        FOREIGN KEY (subject_id, unit_id) 
        REFERENCES public.units(subject_id, id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_unit_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL,
    unit_id INT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, subject_id, unit_id)
);

-- ============================================================================
-- PART 5: PROFESSOR INGESTION SYSTEM TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.course_professors (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (course_id, professor_id)
);

CREATE INDEX IF NOT EXISTS idx_course_professors_course ON public.course_professors(course_id);
CREATE INDEX IF NOT EXISTS idx_course_professors_professor ON public.course_professors(professor_id);

CREATE TABLE IF NOT EXISTS public.ingestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'UPLOADED' 
        CHECK (status IN ('UPLOADED', 'EXTRACTING', 'AI_STRUCTURING', 'READY_FOR_REVIEW', 'APPROVED', 'PUBLISHED', 'FAILED')),
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ingestions_course ON public.ingestions(course_id);
CREATE INDEX IF NOT EXISTS idx_ingestions_created_by ON public.ingestions(created_by);
CREATE INDEX IF NOT EXISTS idx_ingestions_status ON public.ingestions(status);

CREATE TABLE IF NOT EXISTS public.draft_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_id UUID REFERENCES public.ingestions(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    index INT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(ingestion_id, index)
);

CREATE INDEX IF NOT EXISTS idx_draft_units_ingestion ON public.draft_units(ingestion_id);
CREATE INDEX IF NOT EXISTS idx_draft_units_course ON public.draft_units(course_id);

CREATE TABLE IF NOT EXISTS public.draft_subunits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.draft_units(id) ON DELETE CASCADE NOT NULL,
    index INT NOT NULL,
    title TEXT NOT NULL,
    raw_text TEXT,
    intuition TEXT,
    worked_example TEXT,
    pitfalls TEXT,
    recap TEXT,
    code_sketch TEXT,
    "references" TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(unit_id, index)
);

CREATE INDEX IF NOT EXISTS idx_draft_subunits_unit ON public.draft_subunits(unit_id);

CREATE TABLE IF NOT EXISTS public.units_live (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    index INT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(course_id, index)
);

CREATE INDEX IF NOT EXISTS idx_units_live_course ON public.units_live(course_id);

CREATE TABLE IF NOT EXISTS public.subunits_live (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units_live(id) ON DELETE CASCADE NOT NULL,
    index INT NOT NULL,
    title TEXT NOT NULL,
    intuition TEXT,
    worked_example TEXT,
    pitfalls TEXT,
    recap TEXT,
    code_sketch TEXT,
    "references" TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(unit_id, index)
);

CREATE INDEX IF NOT EXISTS idx_subunits_live_unit ON public.subunits_live(unit_id);

-- ============================================================================
-- PART 6: FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mark_subunit_started(
    p_subject_id text,
    p_unit_id int,
    p_sub_unit_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;
    
    INSERT INTO public.user_progress (user_id, subject_id, unit_id, sub_unit_id)
    VALUES (auth.uid(), p_subject_id, p_unit_id, p_sub_unit_id)
    ON CONFLICT (user_id, subject_id, sub_unit_id) DO NOTHING;
    
    INSERT INTO public.user_unit_progress (user_id, subject_id, unit_id)
    VALUES (auth.uid(), p_subject_id, p_unit_id)
    ON CONFLICT (user_id, subject_id, unit_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_subunit_finished(
    p_subject_id text,
    p_unit_id int,
    p_sub_unit_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;
    
    UPDATE public.user_progress
    SET completed_at = NOW()
    WHERE user_id = auth.uid()
      AND subject_id = p_subject_id
      AND unit_id = p_unit_id
      AND sub_unit_id = p_sub_unit_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_unit_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_subunits INT;
    completed_subunits INT;
BEGIN
    IF NEW.completed_at IS NOT NULL AND 
       (TG_OP = 'INSERT' OR (OLD.completed_at IS DISTINCT FROM NEW.completed_at)) THEN
        
        SELECT COUNT(*) INTO total_subunits
        FROM public.subunits s
        WHERE s.subject_id = NEW.subject_id AND s.unit_id = NEW.unit_id;
        
        SELECT COUNT(*) INTO completed_subunits
        FROM public.user_progress up
        WHERE up.user_id = NEW.user_id
          AND up.subject_id = NEW.subject_id
          AND up.unit_id = NEW.unit_id
          AND up.completed_at IS NOT NULL;
        
        IF total_subunits > 0 AND total_subunits = completed_subunits THEN
            INSERT INTO public.user_unit_progress (user_id, subject_id, unit_id, completed_at)
            VALUES (NEW.user_id, NEW.subject_id, NEW.unit_id, NOW())
            ON CONFLICT (user_id, subject_id, unit_id) 
            DO UPDATE SET completed_at = EXCLUDED.completed_at;
        END IF;
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

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
-- PART 7: TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_unit_completion_check ON public.user_progress;
CREATE TRIGGER trg_unit_completion_check
    AFTER INSERT OR UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.check_unit_completion();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ingestions_updated_at ON public.ingestions;
CREATE TRIGGER update_ingestions_updated_at
    BEFORE UPDATE ON public.ingestions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_drafts_updated_at ON public.course_drafts;
CREATE TRIGGER update_course_drafts_updated_at
  BEFORE UPDATE ON public.course_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 8: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subunits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_subunits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subunits_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_published ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 9: RLS POLICIES
-- ============================================================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Published courses are readable by all" ON public.courses;
DROP POLICY IF EXISTS "Users can read their created courses" ON public.courses;
DROP POLICY IF EXISTS "Professors can read all courses" ON public.courses;
DROP POLICY IF EXISTS "Professors can create courses" ON public.courses;
DROP POLICY IF EXISTS "Course professors can update courses" ON public.courses;
DROP POLICY IF EXISTS "Public read access for units" ON public.units;
DROP POLICY IF EXISTS "Public read access for subunits" ON public.subunits;
DROP POLICY IF EXISTS "Users can only manage their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can only view their own unit progress" ON public.user_unit_progress;
DROP POLICY IF EXISTS "Professors can view course professors" ON public.course_professors;
DROP POLICY IF EXISTS "Professors can manage course professors" ON public.course_professors;
DROP POLICY IF EXISTS "Professors can view their ingestions" ON public.ingestions;
DROP POLICY IF EXISTS "Professors can create ingestions" ON public.ingestions;
DROP POLICY IF EXISTS "Professors can update their ingestions" ON public.ingestions;
DROP POLICY IF EXISTS "Professors can manage draft units" ON public.draft_units;
DROP POLICY IF EXISTS "Professors can manage draft subunits" ON public.draft_subunits;
DROP POLICY IF EXISTS "All can read published units" ON public.units_live;
DROP POLICY IF EXISTS "Professors can manage units" ON public.units_live;
DROP POLICY IF EXISTS "All can read published subunits" ON public.subunits_live;
DROP POLICY IF EXISTS "Professors can manage subunits" ON public.subunits_live;
DROP POLICY IF EXISTS "prof_rw_own_drafts" ON public.course_drafts;
DROP POLICY IF EXISTS "prof_rw_own_uploads" ON public.course_uploads;
DROP POLICY IF EXISTS "prof_manage_own_published" ON public.course_published;
DROP POLICY IF EXISTS "students_read_published_content" ON public.course_published;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- COURSES POLICIES (FIXED - NO CIRCULAR DEPENDENCY)
CREATE POLICY "Published courses are readable by all"
ON public.courses FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Users can read their created courses"
ON public.courses FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Professors can read all courses"
ON public.courses FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

CREATE POLICY "Professors can create courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
    AND created_by = auth.uid()
);

CREATE POLICY "Course professors can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- UNITS & SUBUNITS POLICIES (Legacy)
CREATE POLICY "Public read access for units"
ON public.units FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public read access for subunits"
ON public.subunits FOR SELECT
TO anon, authenticated
USING (true);

-- USER PROGRESS POLICIES
CREATE POLICY "Users can only manage their own progress"
ON public.user_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only view their own unit progress"
ON public.user_unit_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- COURSE PROFESSORS POLICIES (FIXED - NO CIRCULAR DEPENDENCY)
CREATE POLICY "Professors can view course professors"
ON public.course_professors FOR SELECT
TO authenticated
USING (
    professor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Professors can manage course professors"
ON public.course_professors FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_professors.course_id
        AND c.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_professors.course_id
        AND c.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- INGESTIONS POLICIES
CREATE POLICY "Professors can view their ingestions"
ON public.ingestions FOR SELECT
TO authenticated
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Professors can create ingestions"
ON public.ingestions FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

CREATE POLICY "Professors can update their ingestions"
ON public.ingestions FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- DRAFT TABLES POLICIES
CREATE POLICY "Professors can manage draft units"
ON public.draft_units FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.ingestions i
        WHERE i.id = draft_units.ingestion_id
        AND i.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.ingestions i
        WHERE i.id = draft_units.ingestion_id
        AND i.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Professors can manage draft subunits"
ON public.draft_subunits FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.draft_units du
        JOIN public.ingestions i ON i.id = du.ingestion_id
        WHERE du.id = draft_subunits.unit_id
        AND i.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.draft_units du
        JOIN public.ingestions i ON i.id = du.ingestion_id
        WHERE du.id = draft_subunits.unit_id
        AND i.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- LIVE TABLES POLICIES
CREATE POLICY "All can read published units"
ON public.units_live FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = units_live.course_id
        AND c.is_published = true
    )
);

CREATE POLICY "Professors can manage units"
ON public.units_live FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = units_live.course_id
        AND c.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = units_live.course_id
        AND c.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "All can read published subunits"
ON public.subunits_live FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.units_live u
        JOIN public.courses c ON c.id = u.course_id
        WHERE u.id = subunits_live.unit_id
        AND c.is_published = true
    )
);

CREATE POLICY "Professors can manage subunits"
ON public.subunits_live FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.units_live u
        JOIN public.courses c ON c.id = u.course_id
        WHERE u.id = subunits_live.unit_id
        AND c.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.units_live u
        JOIN public.courses c ON c.id = u.course_id
        WHERE u.id = subunits_live.unit_id
        AND c.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- COURSE CONTENT SYSTEM POLICIES (NEW)
-- Drafts: Only course owners (professors) can read/write their drafts
CREATE POLICY "prof_rw_own_drafts" ON public.course_drafts
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_drafts.course_id 
      AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_drafts.course_id 
      AND c.created_by = auth.uid()
    )
  );

-- Uploads: Only course owners can read/write their uploads
CREATE POLICY "prof_rw_own_uploads" ON public.course_uploads
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_uploads.course_id 
      AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_uploads.course_id 
      AND c.created_by = auth.uid()
    )
  );

-- Published content: Professors can manage their own, students can read published courses
CREATE POLICY "prof_manage_own_published" ON public.course_published
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_published.course_id 
      AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_published.course_id 
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "students_read_published_content" ON public.course_published
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_published.course_id 
      AND c.status = 'PUBLISHED'
    )
  );

-- ============================================================================
-- PART 10: STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-uploads',
    'course-uploads',
    false,
    209715200,
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/markdown'
    ]
)
ON CONFLICT (id) DO UPDATE
SET 
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
    'ingestion-artifacts',
    'ingestion-artifacts',
    false,
    52428800
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit;

-- ============================================================================
-- PART 11: STORAGE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Professors can upload course files" ON storage.objects;
CREATE POLICY "Professors can upload course files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'course-uploads' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

DROP POLICY IF EXISTS "Professors can read course files" ON storage.objects;
CREATE POLICY "Professors can read course files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'course-uploads' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

DROP POLICY IF EXISTS "Professors can delete course files" ON storage.objects;
CREATE POLICY "Professors can delete course files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'course-uploads' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

DROP POLICY IF EXISTS "Professors can manage artifacts" ON storage.objects;
CREATE POLICY "Professors can manage artifacts"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'ingestion-artifacts' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
)
WITH CHECK (
    bucket_id = 'ingestion-artifacts' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

-- ============================================================================
-- PART 12: FIX EXISTING DATA
-- ============================================================================

UPDATE public.profiles 
SET role = 'student' 
WHERE role IS NULL;

-- ============================================================================
-- END OF COMPLETE SCHEMA
-- ============================================================================
