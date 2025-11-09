-- Course AI Integration Database Schema
-- Run this in Supabase SQL Editor to enable parsing → AI → publish flow

-- 01) Draft & Publish content tables
CREATE TABLE IF NOT EXISTS course_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  schema_version TEXT NOT NULL DEFAULT 'v1',
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_published (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID UNIQUE NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  schema_version TEXT NOT NULL DEFAULT 'v1',
  content JSONB NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 02) Uploads table (if you don't already have it)
CREATE TABLE IF NOT EXISTS course_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_id UUID, -- optional if you track an ingestion row
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  parsed_text TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE course_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_published ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_drafts
CREATE POLICY IF NOT EXISTS "prof_rw_own_drafts" ON course_drafts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.created_by = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.created_by = auth.uid())
  );

-- RLS Policies for course_uploads  
CREATE POLICY IF NOT EXISTS "prof_rw_own_uploads" ON course_uploads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.created_by = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.created_by = auth.uid())
  );

-- RLS Policies for course_published (students can read published content)
CREATE POLICY IF NOT EXISTS "students_read_published_content" ON course_published
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.is_published = true)
  );

-- Professors can manage their own published content
CREATE POLICY IF NOT EXISTS "prof_rw_own_published" ON course_published
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.created_by = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.created_by = auth.uid())
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_drafts_course_id ON course_drafts(course_id);
CREATE INDEX IF NOT EXISTS idx_course_published_course_id ON course_published(course_id);
CREATE INDEX IF NOT EXISTS idx_course_uploads_course_id ON course_uploads(course_id);
CREATE INDEX IF NOT EXISTS idx_course_uploads_ingestion_id ON course_uploads(ingestion_id);

-- Verify tables were created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('course_drafts', 'course_published', 'course_uploads')
ORDER BY table_name, ordinal_position;
