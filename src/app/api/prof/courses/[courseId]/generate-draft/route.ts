/**
 * API route to generate AI draft for a course
 * Uses OpenAI to process parsed text into structured course content
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCourseDraft } from '@/lib/ai/generateCourseDraft';

// Configure for long-running operations (same as upload route)
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get course and verify ownership
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('id, created_by, title, code, term, description, status')
      .eq('id', courseId)
      .single();

    if (cErr) {
      // Use the same error extraction pattern
      const errorDetails: any = {};
      if (cErr.message) errorDetails.message = String(cErr.message);
      if (cErr.code) errorDetails.code = String(cErr.code);
      if (cErr.details) errorDetails.details = String(cErr.details);
      if (cErr.hint) errorDetails.hint = String(cErr.hint);
      
      console.error('[generate-draft.get-course]', errorDetails);
      return NextResponse.json(
        { 
          error: 'Course not found',
          details: cErr.message || 'Failed to load course'
        },
        { status: 404 }
      );
    }

    if (!course || course.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get parsed uploads for this course
    const { data: uploads, error: uErr } = await supabase
      .from('course_uploads')
      .select('id, storage_path, parsed_text, mime_type')
      .eq('course_id', course.id);

    if (uErr) {
      const errorDetails: any = {};
      if (uErr.message) errorDetails.message = String(uErr.message);
      if (uErr.code) errorDetails.code = String(uErr.code);
      if (uErr.details) errorDetails.details = String(uErr.details);
      if (uErr.hint) errorDetails.hint = String(uErr.hint);
      
      console.error('[generate-draft.select-uploads]', errorDetails);
      return NextResponse.json(
        { 
          error: 'Failed to load uploads',
          details: uErr.message || 'Could not fetch course uploads'
        },
        { status: 500 }
      );
    }

    // Filter to only parsed uploads
    const parsed = (uploads ?? [])
      .filter(u => !!u.parsed_text && u.parsed_text.trim().length > 0)
      .map(u => ({ 
        source: u.storage_path, 
        text: u.parsed_text as string 
      }));

    if (parsed.length === 0) {
      const totalFiles = uploads?.length || 0;
      const unparsedFiles = uploads?.filter(u => !u.parsed_text || u.parsed_text.trim().length === 0).length || 0;
      
      return NextResponse.json(
        { 
          error: 'No parsed content available',
          details: `No parsed content found. ${totalFiles} file(s) in database, ${unparsedFiles} need parsing. Please parse files first before generating draft.`,
          totalFiles,
          unparsedFiles
        },
        { status: 400 }
      );
    }

    // Prepare seed metadata
    const seedMeta = { 
      title: course.title || 'Untitled Course', 
      code: course.code || '', 
      term: course.term || '', 
      description: course.description || '' 
    };

    // Generate draft using AI
    console.log(`[generate-draft] Processing ${parsed.length} parsed files for course ${course.id}`);
    
    let draftJson;
    try {
      draftJson = await generateCourseDraft(seedMeta, parsed);
    } catch (aiError: any) {
      console.error('[generate-draft.ai-error]', {
        message: aiError?.message || 'AI generation failed',
        name: aiError?.name || 'Error',
      });
      
      return NextResponse.json(
        { 
          error: 'AI generation failed',
          details: aiError?.message || 'Could not generate course content'
        },
        { status: 500 }
      );
    }

    // Save or update draft
    const { error: upsertErr } = await supabase
      .from('course_drafts')
      .upsert({
        course_id: course.id,
        content: draftJson,
        schema_version: 'v1',
        created_by: user.id,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'course_id' 
      });

    if (upsertErr) {
      const errorDetails: any = {};
      if (upsertErr.message) errorDetails.message = String(upsertErr.message);
      if (upsertErr.code) errorDetails.code = String(upsertErr.code);
      if (upsertErr.details) errorDetails.details = String(upsertErr.details);
      if (upsertErr.hint) errorDetails.hint = String(upsertErr.hint);
      
      console.error('[generate-draft.upsert-draft]', errorDetails);
      return NextResponse.json(
        { 
          error: 'Failed to save draft',
          details: upsertErr.message || 'Could not save generated content'
        },
        { status: 500 }
      );
    }

    // Update course status to READY_FOR_REVIEW
    const { error: statusErr } = await supabase
      .from('courses')
      .update({ 
        status: 'READY_FOR_REVIEW',
        updated_at: new Date().toISOString()
      })
      .eq('id', course.id);

    if (statusErr) {
      const errorDetails: any = {};
      if (statusErr.message) errorDetails.message = String(statusErr.message);
      if (statusErr.code) errorDetails.code = String(statusErr.code);
      if (statusErr.details) errorDetails.details = String(statusErr.details);
      if (statusErr.hint) errorDetails.hint = String(statusErr.hint);
      
      console.error('[generate-draft.update-status]', errorDetails);
      // Don't fail the request, draft was saved successfully
    }

    // Also update ingestion status if we have one
    const { data: ingestion } = await supabase
      .from('ingestions')
      .select('id')
      .eq('course_id', course.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (ingestion) {
      await supabase
        .from('ingestions')
        .update({ 
          status: 'READY_FOR_REVIEW',
          updated_at: new Date().toISOString()
        })
        .eq('id', ingestion.id);
    }

    return NextResponse.json({ 
      ok: true,
      message: 'Draft generated successfully',
      courseId: course.id,
      status: 'READY_FOR_REVIEW'
    });
  } catch (e: any) {
    // Extract error details
    const errorDetails: any = {
      message: e?.message || 'Unknown error',
      name: e?.name || 'Error',
    };
    
    if (e?.stack) errorDetails.stack = e.stack;
    
    console.error('[generate-draft.catch]', errorDetails);
    
    return NextResponse.json(
      { 
        error: e?.message || 'Draft generation failed',
        details: errorDetails.message
      },
      { status: 500 }
    );
  }
}
