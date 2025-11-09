-- ------------------------------------------------------------
-- Professor ingest pipeline support tables & RLS policies
-- Run this script in Supabase SQL editor (query tool)
-- ------------------------------------------------------------

-- 1. Ensure the base courses table exists (simplified schema)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.courses
SET status = COALESCE(status, 'NEW'),
    is_published = COALESCE(is_published, FALSE),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE status IS NULL
   OR created_at IS NULL
   OR updated_at IS NULL
   OR is_published IS NULL;


ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prof_read_own_courses" ON public.courses;
DROP POLICY IF EXISTS "prof_manage_own_courses" ON public.courses;

CREATE POLICY "prof_read_own_courses" ON public.courses
  FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "prof_manage_own_courses" ON public.courses
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 2. Ingestions (pipeline runs tied to a course)
CREATE TABLE IF NOT EXISTS public.ingestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'UPLOADED',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ingestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prof_manage_own_ingestions" ON public.ingestions;

CREATE POLICY "prof_manage_own_ingestions" ON public.ingestions
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_ingestions_course_id ON public.ingestions(course_id);
CREATE INDEX IF NOT EXISTS idx_ingestions_created_by ON public.ingestions(created_by);

-- 3. course_professors (additional editors)
CREATE TABLE IF NOT EXISTS public.course_professors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, professor_id)
);

ALTER TABLE public.course_professors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prof_manage_course_professors" ON public.course_professors;

CREATE POLICY "prof_manage_course_professors" ON public.course_professors
  FOR ALL
  USING (professor_id = auth.uid())
  WITH CHECK (professor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_course_professors_course_id ON public.course_professors(course_id);
CREATE INDEX IF NOT EXISTS idx_course_professors_professor_id ON public.course_professors(professor_id);

UPDATE public.courses c
SET created_by = cp.professor_id
FROM public.course_professors cp
WHERE cp.course_id = c.id
  AND c.created_by IS NULL;

-- 4. course_uploads (files stored in bucket course-uploads)
CREATE TABLE IF NOT EXISTS public.course_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_id UUID REFERENCES public.ingestions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  parsed_text TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.course_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prof_manage_own_uploads" ON public.course_uploads;

CREATE POLICY "prof_manage_own_uploads" ON public.course_uploads
  FOR ALL
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    course_id IN (
      SELECT id FROM public.courses WHERE created_by = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_course_uploads_course_id ON public.course_uploads(course_id);
CREATE INDEX IF NOT EXISTS idx_course_uploads_ingestion_id ON public.course_uploads(ingestion_id);

-- 5. course_drafts (AI generated content)
CREATE TABLE IF NOT EXISTS public.course_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  content JSONB NOT NULL
);

ALTER TABLE public.course_drafts
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS schema_version TEXT DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.course_drafts cd
SET created_by = c.created_by
FROM public.courses c
WHERE cd.course_id = c.id
  AND (cd.created_by IS NULL);

ALTER TABLE public.course_drafts
  ALTER COLUMN created_by SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.course_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prof_manage_own_course_drafts" ON public.course_drafts;

CREATE POLICY "prof_manage_own_course_drafts" ON public.course_drafts
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_course_drafts_course_id ON public.course_drafts(course_id);

-- 6. course_published (final student-visible content)
CREATE TABLE IF NOT EXISTS public.course_published (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  content JSONB NOT NULL
);

ALTER TABLE public.course_published
  ADD COLUMN IF NOT EXISTS schema_version TEXT DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.course_published cp
SET published_by = c.created_by,
    published_at = COALESCE(cp.published_at, now())
FROM public.courses c
WHERE cp.course_id = c.id
  AND cp.published_by IS NULL;

ALTER TABLE public.course_published
  ALTER COLUMN published_at SET NOT NULL,
  ALTER COLUMN published_by SET NOT NULL;

ALTER TABLE public.course_published ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_view_published_courses" ON public.course_published;
DROP POLICY IF EXISTS "prof_manage_published_courses" ON public.course_published;

CREATE POLICY "students_view_published_courses" ON public.course_published
  FOR SELECT
  USING (true);

CREATE POLICY "prof_manage_published_courses" ON public.course_published
  FOR ALL
  USING (published_by = auth.uid())
  WITH CHECK (published_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_course_published_course_id ON public.course_published(course_id);

-- 7. Convenience status update trigger (optional)
CREATE OR REPLACE FUNCTION public.set_course_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_course_updated_at();

-- 8. Final sanity check
SELECT 'Tables ready for ingest pipeline' AS status;

