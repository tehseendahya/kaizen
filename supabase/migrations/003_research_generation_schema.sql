-- ============================================================================
-- Research-Driven Course Generation Schema
-- ============================================================================
-- This migration adds tables for the new research-based generation system

-- ============================================================================
-- PART 1: COURSE SCHEMAS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_schemas (
  course_id TEXT PRIMARY KEY,
  version INT NOT NULL DEFAULT 1,
  schema_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_course_schemas_created_by ON public.course_schemas(created_by);
CREATE INDEX IF NOT EXISTS idx_course_schemas_updated_at ON public.course_schemas(updated_at);

-- ============================================================================
-- PART 2: GENERATION LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES public.course_schemas(course_id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  subunit_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' 
    CHECK (status IN ('queued', 'researching', 'composing', 'qa', 'published', 'failed', 'research_unavailable')),
  depth TEXT NOT NULL DEFAULT 'standard' CHECK (depth IN ('standard', 'deep')),
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  searched_count INT DEFAULT 0,
  kept_count INT DEFAULT 0,
  filtered_sources JSONB DEFAULT '[]'::jsonb,
  qa_result JSONB,
  word_count INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generation_logs_course_id ON public.generation_logs(course_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON public.generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_subunit ON public.generation_logs(course_id, unit_id, subunit_id);

-- ============================================================================
-- PART 3: RESEARCH CACHE TABLE (for search results)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,  -- hash of query + depth + version
  subunit_id TEXT NOT NULL,
  course_version INT NOT NULL,
  search_results JSONB NOT NULL,
  fetched_content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days') NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_research_cache_key ON public.research_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_research_cache_expires ON public.research_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_research_cache_subunit ON public.research_cache(subunit_id);

-- ============================================================================
-- PART 4: UPDATE TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_course_schemas_updated_at ON public.course_schemas;
CREATE TRIGGER update_course_schemas_updated_at
  BEFORE UPDATE ON public.course_schemas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 5: ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.course_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_cache ENABLE ROW LEVEL SECURITY;

-- Course schemas: Only creators can read/write their schemas
DROP POLICY IF EXISTS "prof_rw_own_schemas" ON public.course_schemas;
CREATE POLICY "prof_rw_own_schemas" ON public.course_schemas
  FOR ALL TO authenticated
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

-- Generation logs: Only course owners can read their logs
DROP POLICY IF EXISTS "prof_read_own_logs" ON public.generation_logs;
CREATE POLICY "prof_read_own_logs" ON public.generation_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_schemas cs
      WHERE cs.course_id = generation_logs.course_id
        AND cs.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can write generation logs
DROP POLICY IF EXISTS "service_write_logs" ON public.generation_logs;
CREATE POLICY "service_write_logs" ON public.generation_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Research cache: Service role only (internal caching)
DROP POLICY IF EXISTS "service_manage_cache" ON public.research_cache;
CREATE POLICY "service_manage_cache" ON public.research_cache
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- PART 6: CLEANUP FUNCTION (delete expired cache entries)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_research_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.research_cache
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run daily via pg_cron or external cron)
-- NOTE: Uncomment if pg_cron extension is available
-- SELECT cron.schedule('cleanup-research-cache', '0 3 * * *', 'SELECT public.cleanup_expired_research_cache()');

