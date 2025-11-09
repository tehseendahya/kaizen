-- Add meta column to course_drafts to store research metadata
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'course_drafts' 
    AND column_name = 'meta'
  ) THEN
    ALTER TABLE public.course_drafts 
    ADD COLUMN meta JSONB DEFAULT '{}'::jsonb;
    
    COMMENT ON COLUMN public.course_drafts.meta IS 'Metadata including research sources, citations, and generation details';
  END IF;
END $$;

-- Add created_by column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'course_drafts' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.course_drafts 
    ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

