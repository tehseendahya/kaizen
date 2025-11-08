import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

// Configure route to allow larger body sizes
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large file uploads

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
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError: any) {
      console.error('Error parsing form data:', {
        message: parseError?.message || 'Unknown error',
        name: parseError?.name || 'Error',
      });
      return NextResponse.json(
        { error: 'Failed to parse form data', details: parseError?.message || 'Invalid request format' },
        { status: 400 }
      );
    }

    const courseId = formData.get('courseId') as string;
    const files = formData.getAll('files') as File[];

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Log file info for debugging
    console.log(`Uploading ${files.length} file(s):`, files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })));

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
    const uploadErrors: Array<{ fileName: string; error: any }> = [];
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        uploadErrors.push({
          fileName: file.name,
          error: { message: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` }
        });
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = `${courseId}/${ingestion.id}/${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('course-uploads')
          .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
          });

        if (uploadError) {
          // Extract error details properly
          const errorInfo: any = {
            message: uploadError.message || 'Unknown storage error',
            statusCode: uploadError.statusCode || '',
            error: uploadError.error || '',
          };
          
          // Try to get all properties
          try {
            const ownProps = Object.getOwnPropertyNames(uploadError);
            ownProps.forEach(prop => {
              if (!errorInfo[prop]) {
                try {
                  const value = (uploadError as any)[prop];
                  if (value !== undefined && value !== null) {
                    errorInfo[prop] = typeof value === 'object' ? JSON.stringify(value) : String(value);
                  }
                } catch (e) {
                  // Skip
                }
              }
            });
          } catch (e) {
            // Continue
          }
          
          console.error(`Error uploading ${file.name}:`, errorInfo);
          uploadErrors.push({ fileName: file.name, error: errorInfo });
          continue;
        }

        if (uploadData) {
          uploadedFiles.push(filePath);
          console.log(`Successfully uploaded ${file.name} to ${filePath}`);
        } else {
          uploadErrors.push({
            fileName: file.name,
            error: { message: 'Upload returned no data' }
          });
        }
      } catch (fileError: any) {
        const errorInfo: any = {
          message: fileError?.message || 'Unknown file processing error',
          name: fileError?.name || 'Error',
        };
        
        if (fileError?.stack) errorInfo.stack = fileError.stack;
        
        console.error(`Error processing file ${file.name}:`, errorInfo);
        uploadErrors.push({ fileName: file.name, error: errorInfo });
      }
    }

    if (uploadedFiles.length === 0) {
      // Delete ingestion if no files uploaded
      await supabase.from('ingestions').delete().eq('id', ingestion.id);
      
      // Return detailed error information
      return NextResponse.json(
        { 
          error: 'No files were uploaded successfully',
          details: uploadErrors.length > 0 
            ? uploadErrors.map(e => `${e.fileName}: ${e.error.message || 'Unknown error'}`).join('; ')
            : 'All files failed to upload',
          uploadErrors: uploadErrors,
        },
        { status: 400 }
      );
    }

    // Update ingestion with file count
    await supabase
      .from('ingestions')
      .update({ status: 'UPLOADED' })
      .eq('id', ingestion.id);

    return NextResponse.json({ ingestionId: ingestion.id });
  } catch (error) {
    // Extract comprehensive error details
    const errorDetails: any = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Error',
    };
    
    if (error instanceof Error) {
      if (error.stack) errorDetails.stack = error.stack;
      if (error.cause) errorDetails.cause = error.cause;
    }
    
    console.error('Unexpected error in upload route:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: errorDetails.message,
        hint: 'Check server logs for more details',
      },
      { status: 500 }
    );
  }
}

