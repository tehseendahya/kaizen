-- ============================================================================
-- Professor Course Ingestion System - Database Migration
-- ============================================================================
-- This migration creates all tables, RLS policies, and storage buckets
-- for the professor-facing course ingestion workflow.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENSURE PROFILES TABLE HAS ROLE COLUMN
-- ----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT DEFAULT 'student' 
        CHECK (role IN ('student', 'professor', 'admin')) NOT NULL;
        
        UPDATE public.profiles 
        SET role = 'student' 
        WHERE role IS NULL;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. COURSES TABLE (Updated schema)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.courses_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Migrate existing courses if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        INSERT INTO public.courses_new (id, code, title, description, created_at)
        SELECT 
            gen_random_uuid(),
            subject_id,
            full_name,
            description,
            created_at
        FROM public.courses
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Drop old table and rename new one (if old exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses' AND table_name != 'courses_new') THEN
        DROP TABLE IF EXISTS public.courses CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses_new') THEN
        ALTER TABLE public.courses_new RENAME TO courses;
    END IF;
END $$;

-- If courses table doesn't exist, create it
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

-- ----------------------------------------------------------------------------
-- 3. COURSE PROFESSORS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_professors (
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    professor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (course_id, professor_id)
);

CREATE INDEX IF NOT EXISTS idx_course_professors_course ON public.course_professors(course_id);
CREATE INDEX IF NOT EXISTS idx_course_professors_professor ON public.course_professors(professor_id);

-- ----------------------------------------------------------------------------
-- 4. INGESTIONS TABLE
-- ----------------------------------------------------------------------------

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

-- ----------------------------------------------------------------------------
-- 5. DRAFT UNITS TABLE
-- ----------------------------------------------------------------------------

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

-- ----------------------------------------------------------------------------
-- 6. DRAFT SUBUNITS TABLE
-- ----------------------------------------------------------------------------

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
    references TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(unit_id, index)
);

CREATE INDEX IF NOT EXISTS idx_draft_subunits_unit ON public.draft_subunits(unit_id);

-- ----------------------------------------------------------------------------
-- 7. LIVE UNITS TABLE (Updated schema)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.units_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    index INT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(course_id, index)
);

-- Migrate existing units if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units') THEN
        -- Try to migrate, but this is complex due to schema differences
        -- We'll keep both for now
        NULL;
    END IF;
END $$;

-- Drop old and rename if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units' AND table_name != 'units_new') THEN
        -- Don't drop, keep old for compatibility
        NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units_new') THEN
        ALTER TABLE public.units_new RENAME TO units_live;
    END IF;
END $$;

-- Create new units table
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

-- ----------------------------------------------------------------------------
-- 8. LIVE SUBUNITS TABLE
-- ----------------------------------------------------------------------------

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
    references TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(unit_id, index)
);

CREATE INDEX IF NOT EXISTS idx_subunits_live_unit ON public.subunits_live(unit_id);

-- ----------------------------------------------------------------------------
-- 9. UPDATE TRIGGER FUNCTION
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
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

-- ----------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_subunits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subunits_live ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 11. RLS POLICIES - COURSES
-- ----------------------------------------------------------------------------

-- Published courses readable by all
DROP POLICY IF EXISTS "Published courses are readable by all" ON public.courses;
CREATE POLICY "Published courses are readable by all"
ON public.courses FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Professors can read their own courses (published or not)
DROP POLICY IF EXISTS "Professors can read their courses" ON public.courses;
CREATE POLICY "Professors can read their courses"
ON public.courses FOR SELECT
TO authenticated
USING (
    is_published = true OR
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.course_professors cp
        WHERE cp.course_id = courses.id
        AND cp.professor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

-- Only professors/admins can insert courses
DROP POLICY IF EXISTS "Professors can create courses" ON public.courses;
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

-- Only course professors/admins can update
DROP POLICY IF EXISTS "Course professors can update courses" ON public.courses;
CREATE POLICY "Course professors can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.course_professors cp
        WHERE cp.course_id = courses.id
        AND cp.professor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.course_professors cp
        WHERE cp.course_id = courses.id
        AND cp.professor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ----------------------------------------------------------------------------
-- 12. RLS POLICIES - COURSE PROFESSORS
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Professors can view course professors" ON public.course_professors;
CREATE POLICY "Professors can view course professors"
ON public.course_professors FOR SELECT
TO authenticated
USING (
    professor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_professors.course_id
        AND (c.created_by = auth.uid() OR c.is_published = true)
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Professors can manage course professors" ON public.course_professors;
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

-- ----------------------------------------------------------------------------
-- 13. RLS POLICIES - INGESTIONS
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Professors can view their ingestions" ON public.ingestions;
CREATE POLICY "Professors can view their ingestions"
ON public.ingestions FOR SELECT
TO authenticated
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.course_professors cp
        WHERE cp.course_id = ingestions.course_id
        AND cp.professor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Professors can create ingestions" ON public.ingestions;
CREATE POLICY "Professors can create ingestions"
ON public.ingestions FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    ) AND
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = ingestions.course_id
        AND (c.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = c.id AND cp.professor_id = auth.uid()
        ))
    )
);

DROP POLICY IF EXISTS "Professors can update their ingestions" ON public.ingestions;
CREATE POLICY "Professors can update their ingestions"
ON public.ingestions FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.course_professors cp
        WHERE cp.course_id = ingestions.course_id
        AND cp.professor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.course_professors cp
        WHERE cp.course_id = ingestions.course_id
        AND cp.professor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ----------------------------------------------------------------------------
-- 14. RLS POLICIES - DRAFT TABLES
-- ----------------------------------------------------------------------------

-- Draft units
DROP POLICY IF EXISTS "Professors can manage draft units" ON public.draft_units;
CREATE POLICY "Professors can manage draft units"
ON public.draft_units FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.ingestions i
        WHERE i.id = draft_units.ingestion_id
        AND (i.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = i.course_id AND cp.professor_id = auth.uid()
        ))
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
        AND (i.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = i.course_id AND cp.professor_id = auth.uid()
        ))
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Draft subunits
DROP POLICY IF EXISTS "Professors can manage draft subunits" ON public.draft_subunits;
CREATE POLICY "Professors can manage draft subunits"
ON public.draft_subunits FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.draft_units du
        JOIN public.ingestions i ON i.id = du.ingestion_id
        WHERE du.id = draft_subunits.unit_id
        AND (i.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = i.course_id AND cp.professor_id = auth.uid()
        ))
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
        AND (i.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = i.course_id AND cp.professor_id = auth.uid()
        ))
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ----------------------------------------------------------------------------
-- 15. RLS POLICIES - LIVE TABLES
-- ----------------------------------------------------------------------------

-- Live units - readable by all, writable by professors
DROP POLICY IF EXISTS "All can read published units" ON public.units_live;
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

DROP POLICY IF EXISTS "Professors can manage units" ON public.units_live;
CREATE POLICY "Professors can manage units"
ON public.units_live FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = units_live.course_id
        AND (c.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = c.id AND cp.professor_id = auth.uid()
        ))
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
        AND (c.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = c.id AND cp.professor_id = auth.uid()
        ))
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Live subunits - readable by all, writable by professors
DROP POLICY IF EXISTS "All can read published subunits" ON public.subunits_live;
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

DROP POLICY IF EXISTS "Professors can manage subunits" ON public.subunits_live;
CREATE POLICY "Professors can manage subunits"
ON public.subunits_live FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.units_live u
        JOIN public.courses c ON c.id = u.course_id
        WHERE u.id = subunits_live.unit_id
        AND (c.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = c.id AND cp.professor_id = auth.uid()
        ))
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
        AND (c.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.course_professors cp
            WHERE cp.course_id = c.id AND cp.professor_id = auth.uid()
        ))
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ----------------------------------------------------------------------------
-- 16. STORAGE BUCKETS
-- ----------------------------------------------------------------------------

-- Course uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-uploads',
    'course-uploads',
    false,
    209715200, -- 200MB
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

-- Ingestion artifacts bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
    'ingestion-artifacts',
    'ingestion-artifacts',
    false,
    52428800 -- 50MB
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit;

-- ----------------------------------------------------------------------------
-- 17. STORAGE POLICIES
-- ----------------------------------------------------------------------------

-- Course uploads - professors only
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

-- Ingestion artifacts - professors only
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
-- END OF MIGRATION
-- ============================================================================

