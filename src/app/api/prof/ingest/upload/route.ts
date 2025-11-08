import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

/**
 * POST /api/prof/ingest/upload
 * Upload course files and create ingestion record
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify professor role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'professor' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;
    const files = formData.getAll('files') as File[];

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Verify course ownership
    const { data: course } = await supabase
      .from('courses')
      .select('id, code')
      .eq('id', courseId)
      .single();

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check ownership
    const { data: isOwner } = await supabase
      .from('course_professors')
      .select('course_id')
      .eq('course_id', courseId)
      .eq('professor_id', user.id)
      .single();

    if (!isOwner && course.created_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized for this course' }, { status: 403 });
    }

    // Create ingestion record
    const { data: ingestion, error: ingestionError } = await supabase
      .from('ingestions')
      .insert({
        course_id: courseId,
        created_by: user.id,
        status: 'UPLOADED',
      })
      .select()
      .single();

    if (ingestionError) {
      console.error('Error creating ingestion:', ingestionError);
      return NextResponse.json({ error: 'Failed to create ingestion' }, { status: 500 });
    }

    // Upload files to Supabase Storage
    const uploadedFiles: string[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        continue; // Skip oversized files
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = `${courseId}/${ingestion.id}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('course-uploads')
        .upload(filePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        console.error(`Error uploading ${file.name}:`, uploadError);
        continue;
      }

      uploadedFiles.push(filePath);
    }

    if (uploadedFiles.length === 0) {
      // Delete ingestion if no files uploaded
      await supabase.from('ingestions').delete().eq('id', ingestion.id);
      return NextResponse.json({ error: 'No files were uploaded successfully' }, { status: 400 });
    }

    // Update ingestion with file count
    await supabase
      .from('ingestions')
      .update({ status: 'UPLOADED' })
      .eq('id', ingestion.id);

    return NextResponse.json({ ingestionId: ingestion.id });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

