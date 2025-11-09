/**
 * API route to publish a course draft
 * Copies draft content to published table and updates course status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
      .select('id, created_by, title, status')
      .eq('id', courseId)
      .single();

    if (cErr) {
      // Use the same error extraction pattern
      const errorDetails: any = {};
      if (cErr.message) errorDetails.message = String(cErr.message);
      if (cErr.code) errorDetails.code = String(cErr.code);
      if (cErr.details) errorDetails.details = String(cErr.details);
      if (cErr.hint) errorDetails.hint = String(cErr.hint);
      
      console.error('[publish.get-course]', errorDetails);
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

    // Get the draft
    const { data: draft, error: dErr } = await supabase
      .from('course_drafts')
      .select('content, schema_version')
      .eq('course_id', course.id)
      .single();

    if (dErr || !draft) {
      const errorDetails: any = {};
      if (dErr) {
        if (dErr.message) errorDetails.message = String(dErr.message);
        if (dErr.code) errorDetails.code = String(dErr.code);
        if (dErr.details) errorDetails.details = String(dErr.details);
        if (dErr.hint) errorDetails.hint = String(dErr.hint);
      }
      
      console.error('[publish.get-draft]', errorDetails);
      return NextResponse.json(
        { 
          error: 'No draft to publish',
          details: dErr?.message || 'Please generate a draft first'
        },
        { status: 400 }
      );
    }

    // Upsert to published table (update if exists, insert if not)
    const { error: upsertErr } = await supabase
      .from('course_published')
      .upsert({
        course_id: course.id,
        content: draft.content,
        schema_version: draft.schema_version || 'v1',
        published_at: new Date().toISOString()
      }, { 
        onConflict: 'course_id' 
      });

    if (upsertErr) {
      const errorDetails: any = {};
      if (upsertErr.message) errorDetails.message = String(upsertErr.message);
      if (upsertErr.code) errorDetails.code = String(upsertErr.code);
      if (upsertErr.details) errorDetails.details = String(upsertErr.details);
      if (upsertErr.hint) errorDetails.hint = String(upsertErr.hint);
      
      console.error('[publish.upsert]', errorDetails);
      return NextResponse.json(
        { 
          error: 'Failed to publish',
          details: upsertErr.message || 'Could not publish course content'
        },
        { status: 500 }
      );
    }

    // Update course status to PUBLISHED and set is_published flag
    const { error: statusErr } = await supabase
      .from('courses')
      .update({ 
        status: 'PUBLISHED',
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', course.id);

    if (statusErr) {
      const errorDetails: any = {};
      if (statusErr.message) errorDetails.message = String(statusErr.message);
      if (statusErr.code) errorDetails.code = String(statusErr.code);
      if (statusErr.details) errorDetails.details = String(statusErr.details);
      if (statusErr.hint) errorDetails.hint = String(statusErr.hint);
      
      console.error('[publish.update-status]', errorDetails);
      // Don't fail the request, content was published successfully
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
          status: 'PUBLISHED',
          updated_at: new Date().toISOString()
        })
        .eq('id', ingestion.id);
    }

    console.log(`[publish] Successfully published course ${course.id} - ${course.title}`);

    return NextResponse.json({ 
      ok: true,
      message: 'Course published successfully',
      courseId: course.id,
      courseTitle: course.title,
      publishedAt: new Date().toISOString()
    });
  } catch (e: any) {
    // Extract error details
    const errorDetails: any = {
      message: e?.message || 'Unknown error',
      name: e?.name || 'Error',
    };
    
    if (e?.stack) errorDetails.stack = e.stack;
    
    console.error('[publish.catch]', errorDetails);
    
    return NextResponse.json(
      { 
        error: e?.message || 'Publish failed',
        details: errorDetails.message
      },
      { status: 500 }
    );
  }
}
