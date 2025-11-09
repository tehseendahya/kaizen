-- Create basic courses table for course creation (FIXED)
-- Run this in Supabase SQL Editor

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "prof_manage_own_courses" ON courses;
DROP POLICY IF EXISTS "public_read_published_courses" ON courses;

-- Create policies (without IF NOT EXISTS)
CREATE POLICY "prof_manage_own_courses" ON courses 
  FOR ALL USING (created_by = auth.uid()) 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "public_read_published_courses" ON courses 
  FOR SELECT USING (is_published = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);

-- Verify table was created
SELECT 'Courses table ready!' as status;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;
