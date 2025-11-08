-- ============================================================================
-- Fix RLS Infinite Recursion in Courses Policies
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the infinite recursion error
-- ============================================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Professors can read their courses" ON public.courses;
DROP POLICY IF EXISTS "Published courses are readable by all" ON public.courses;
DROP POLICY IF EXISTS "Public read access for courses" ON public.courses;
DROP POLICY IF EXISTS "Professors can view course professors" ON public.course_professors;

-- Recreate courses SELECT policies without circular dependency
-- Policy 1: Published courses readable by all
CREATE POLICY "Published courses are readable by all"
ON public.courses FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Policy 2: Professors can read courses they created (no circular check)
CREATE POLICY "Professors can read their created courses"
ON public.courses FOR SELECT
TO authenticated
USING (
    created_by = auth.uid()
);

-- Policy 3: Professors/admins can read any course (for professor portal)
-- This avoids checking course_professors which would cause recursion
CREATE POLICY "Professors can read all courses"
ON public.courses FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

-- Recreate course_professors SELECT policy without circular dependency
-- Check course_professors directly without querying courses table
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

-- ============================================================================
-- END OF FIX
-- ============================================================================

