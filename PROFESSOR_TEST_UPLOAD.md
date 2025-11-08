# Professor Upload Test Page

## Overview

A comprehensive test page to verify the professor upload pipeline works end-to-end with RLS policies.

## Route

**`/professor/test-upload`**

## Features

1. **Role Verification**: Shows professor badge and user info
2. **Course Selection**: Dropdown of existing courses or quick-add form
3. **Import Creation**: Creates `ingestions` record and displays import ID
4. **File Upload**: 
   - Drag & drop or file picker
   - Uploads to `course-uploads` storage bucket
   - Tracks files via storage listing
5. **Import Management**:
   - Mark import as ready
   - Refresh file list
   - Reset import session
6. **RLS Self-Check**: Verifies:
   - Can read own ingestion ✅
   - Can access own files ✅
   - Cannot read other users' imports ✅

## Usage

### For Professors

1. Navigate to `/professor/test-upload`
2. Select or create a course
3. Click "Start Import" → get import ID
4. Select files and click "Upload Files"
5. View uploaded files in the summary table
6. Click "Mark Import Complete" to set status to `READY_FOR_REVIEW`
7. Click "Run RLS Checks" to verify security

### For Students

- Visiting `/professor/test-upload` shows a 403 error page
- Cannot access any professor functionality

## Schema Notes

This test page works with:
- **`ingestions`** table (not `course_imports`)
- **`courses`** table with UUID `id` and `code`/`title` fields
- **Storage bucket**: `course-uploads`
- Files tracked via storage listing (no `uploaded_files` table in current schema)

## Manual Test Plan

### ✅ Professor Happy Path

1. Log in as professor
2. Go to `/professor/test-upload`
3. Create course: CS201 - Data Structures
4. Start import → see import_id
5. Upload 2-3 files (PDF, DOCX, PNG)
6. See files listed with size/path
7. Click "Refresh List" to confirm persistence
8. Click "Mark Import Complete" → status set to `READY_FOR_REVIEW`
9. Click "Run RLS Checks" → verify:
   - "Self import visible: YES ✅"
   - "Own files accessible: YES ✅"
   - "Bogus/other import visible: NO ✅"

### ✅ Student Access Denial

1. Log out
2. Log in as student
3. Visit `/professor/test-upload` → see 403 card
4. Cannot access any functionality

## Files Created

- `src/app/professor/test-upload/page.tsx` - Server component with auth guard
- `src/app/professor/test-upload/TestUploadClient.tsx` - Client component with all logic
- Updated `src/lib/supabase/middleware.ts` - Added `/professor` route protection

## Notes

- The page uses `ingestions` table (our actual schema)
- Files are tracked via storage listing since we don't have `uploaded_files` table
- RLS checks verify both database and storage access
- All operations respect RLS policies automatically

