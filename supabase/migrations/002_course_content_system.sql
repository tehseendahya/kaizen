-- ============================================================================
-- Course Content System - Draft, Publish, and Upload Tables
-- ============================================================================
-- This migration adds tables for the course content pipeline:
-- - course_drafts: AI-generated draft content
-- - course_published: Approved and published content for students
-- - course_uploads: File upload tracking with parsed text
-- ============================================================================

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 1: COURSE DRAFTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  schema_version TEXT NOT NULL DEFAULT 'v1',
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT course_drafts_unique_course UNIQUE (course_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_drafts_course_id ON public.course_drafts(course_id);

-- ============================================================================
-- PART 2: COURSE PUBLISHED TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_published (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID UNIQUE NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  schema_version TEXT NOT NULL DEFAULT 'v1',
  content JSONB NOT NULL,
  published_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_published_course_id ON public.course_published(course_id);

-- ============================================================================
-- PART 3: COURSE UPLOADS TABLE (if not exists from previous migration)
-- ============================================================================
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_uploads_course_id ON public.course_uploads(course_id);
CREATE INDEX IF NOT EXISTS idx_course_uploads_ingestion_id ON public.course_uploads(ingestion_id);

-- ============================================================================
-- PART 4: ADD STATUS COLUMN TO COURSES (if not exists)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'courses' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.courses 
    ADD COLUMN status TEXT DEFAULT 'DRAFT' 
    CHECK (status IN ('DRAFT', 'READY_FOR_REVIEW', 'PUBLISHED')) NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- PART 5: UPDATE TRIGGER FOR DRAFTS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS update_course_drafts_updated_at ON public.course_drafts;
CREATE TRIGGER update_course_drafts_updated_at
  BEFORE UPDATE ON public.course_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.course_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_published ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 7: RLS POLICIES
-- ============================================================================

-- Drafts: Only course owners (professors) can read/write their drafts
DROP POLICY IF EXISTS "prof_rw_own_drafts" ON public.course_drafts;
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
DROP POLICY IF EXISTS "prof_rw_own_uploads" ON public.course_uploads;
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
DROP POLICY IF EXISTS "prof_manage_own_published" ON public.course_published;
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

DROP POLICY IF EXISTS "students_read_published_content" ON public.course_published;
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
-- PART 8: ADD TERM COLUMN TO COURSES (if not exists)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'courses' 
    AND column_name = 'term'
  ) THEN
    ALTER TABLE public.courses ADD COLUMN term TEXT;
  END IF;
END $$;
