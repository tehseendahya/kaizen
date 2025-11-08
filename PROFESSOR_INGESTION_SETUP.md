# Professor Course Ingestion System - Setup Guide

## Overview

This system allows professors to upload course files (PDF, DOCX, TXT, MD), automatically extract and organize content using AI, review the generated structure, and publish it to make courses available to students.

## Prerequisites

1. **Database Migration**: Run the SQL migration file:
   ```
   supabase/migrations/001_prof_ingestion.sql
   ```
   In your Supabase Dashboard → SQL Editor

2. **Environment Variables**: Add to `.env.local`:
   ```env
   # Supabase (if not already set)
   NEXT_PUBLIC_SUPABASE_URL=https://hnseoyisugkupiexpzdf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhuc2VveWlzdWdrdXBpZXhwemRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTI1MTMsImV4cCI6MjA3Nzg2ODUxM30.QU9TBodYJ_5DHzY_KQKZSnBre5UUpG0Ycu2kTXIoNUg
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhuc2VveWlzdWdrdXBpZXhwemRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI5MjUxMywiZXhwIjoyMDc3ODY4NTEzfQ.cVQfqFAag09QuDX9EXT-A5EJ2ZDkIck3zXhVVyJdOQI

   # AI (if not already set)
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
   # OR
   GOOGLE_API_KEY=your_gemini_key  # Fallback
   GEMINI_MODEL=gemini-2.0-flash-lite  # Optional, defaults to this

   # File limits
   MAX_UPLOAD_MB=200  # Optional, defaults to 200MB
   ```

3. **Set User Role**: After creating a user account, set their role to 'professor':
   ```sql
   UPDATE profiles SET role = 'professor' WHERE id = 'user-id-here';
   ```

## System Architecture

### Flow
1. **Professor Uploads** → Files stored in Supabase Storage
2. **Extraction** → Text extracted from PDF/DOCX/TXT/MD
3. **AI Organization** → Content organized into Units/Subunits
4. **AI Enrichment** → Each subunit enriched with intuition, examples, pitfalls, etc.
5. **Review** → Professor previews draft content
6. **Publish** → Content moved to live tables, course becomes visible to students

### Database Tables

**Core:**
- `courses` - Course metadata
- `course_professors` - Professor-course associations
- `ingestions` - Ingestion job tracking

**Draft (Staging):**
- `draft_units` - Proposed units before approval
- `draft_subunits` - Proposed subunits with AI-generated content

**Live (Published):**
- `units_live` - Published units visible to students
- `subunits_live` - Published subunits visible to students

### Storage Buckets

- `course-uploads` - Original uploaded files (private)
- `ingestion-artifacts` - Processing artifacts (private)

## Usage

### For Professors

1. **Access Portal**: Visit `/prof` (requires professor role)
2. **Create Course**: Go to "New Ingestion" → Create new course or select existing
3. **Upload Files**: Drag & drop or select PDF/DOCX/TXT/MD files
4. **Wait for Processing**: System extracts text and organizes with AI (2-5 minutes)
5. **Review**: Preview generated structure on ingestion detail page
6. **Approve & Publish**: Click "Approve & Publish" to make course live

### API Endpoints

- `GET /api/prof/courses` - List professor's courses
- `POST /api/prof/courses` - Create new course
- `POST /api/prof/ingest/upload` - Upload files and create ingestion
- `POST /api/prof/ingest/start?ingestionId=...` - Start processing
- `GET /api/prof/ingest/status?ingestionId=...` - Get ingestion status
- `POST /api/prof/ingest/approve?ingestionId=...` - Approve and publish

## File Structure

```
src/
  app/
    prof/
      layout.tsx                    # Professor portal layout
      page.tsx                      # Dashboard with ingestions table
      courses/
        page.tsx                    # My Courses page
      ingest/
        new/
          page.tsx                  # New ingestion wizard
        [ingestionId]/
          page.tsx                  # Ingestion detail (server)
          IngestionDetailClient.tsx # Ingestion detail (client)
    api/
      prof/
        courses/
          route.ts                  # Course CRUD
        ingest/
          upload/
            route.ts                # File upload handler
          start/
            route.ts                # Start processing
          status/
            route.ts                # Get status
          approve/
            route.ts                # Approve & publish
  lib/
    processing/
      pdf.ts                        # PDF extraction
      docx.ts                       # DOCX extraction
      text.ts                       # Text/MD extraction
      ingest.ts                     # Main processing pipeline
    ai/
      index.ts                      # AI client factory
      prompts.ts                    # Prompt builders
      schemas.ts                    # Zod validation schemas
    supabase/
      service.ts                    # Service role client
```

## Security

- **RLS Policies**: All tables have Row Level Security enabled
- **Role-Based Access**: Only professors can access `/prof` routes
- **Ownership Checks**: Professors can only manage their own courses/ingestions
- **Service Role**: Used only server-side for elevated operations

## Troubleshooting

### "Forbidden" errors
- Check user role: `SELECT role FROM profiles WHERE id = 'user-id'`
- Verify course ownership in `course_professors` table

### Processing fails
- Check ingestion `error` field in database
- Verify AI API key is set correctly
- Check file formats are supported (PDF, DOCX, TXT, MD)

### Files not uploading
- Verify storage bucket exists: `course-uploads`
- Check file size limits (200MB default)
- Verify storage policies allow professor uploads

### AI processing slow
- Large files take longer to process
- Consider splitting very large documents
- Check Gemini API quota/limits

## Next Steps

1. **Run Migration**: Execute SQL migration in Supabase
2. **Set Environment Variables**: Add required env vars
3. **Set User Role**: Update your profile to 'professor'
4. **Test Upload**: Try uploading a small PDF/DOCX file
5. **Review & Publish**: Check the generated content and publish

## Notes

- Processing happens asynchronously - the UI polls for status updates
- Large files may take several minutes to process
- AI-generated content should always be reviewed before publishing
- Draft content is only visible to professors, not students
- Published courses are visible to all authenticated users

