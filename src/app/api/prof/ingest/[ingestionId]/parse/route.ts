/**
 * API route to parse uploaded files for an ingestion
 * Extracts text from PDFs, DOCX, and text files
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseUploads } from '@/lib/parsing/parseUploads';
import { createClient } from '@/lib/supabase/server';

// Configure for long-running operations (same as upload route)
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ingestionId: string }> }
) {
  const { ingestionId } = await params;
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
    // Get ingestion and verify ownership
    const { data: ingestion, error: ingErr } = await supabase
      .from('ingestions')
      .select('id, course_id, created_by')
      .eq('id', ingestionId)
      .single();

    if (ingErr) {
      // Use the same error extraction pattern
      const errorDetails: any = {};
      if (ingErr.message) errorDetails.message = String(ingErr.message);
      if (ingErr.code) errorDetails.code = String(ingErr.code);
      if (ingErr.details) errorDetails.details = String(ingErr.details);
      if (ingErr.hint) errorDetails.hint = String(ingErr.hint);
      
      console.error('[parse.lookup]', errorDetails);
      return NextResponse.json(
        { 
          error: 'Failed to resolve ingestion',
          details: ingErr.message || 'Ingestion not found'
        },
        { status: 400 }
      );
    }

    if (!ingestion?.course_id) {
      return NextResponse.json(
        { error: 'No course associated with this ingestion' },
        { status: 400 }
      );
    }

    // Verify user owns this ingestion
    if (ingestion.created_by !== user.id) {
      // Also check if they own the course
      const { data: course } = await supabase
        .from('courses')
        .select('created_by')
        .eq('id', ingestion.course_id)
        .single();
      
      if (!course || course.created_by !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // First, check if course_uploads records already exist
    const { data: existingUploads, error: checkError } = await supabase
      .from('course_uploads')
      .select('id, storage_path, parsed_text')
      .eq('course_id', ingestion.course_id)
      .eq('ingestion_id', ingestionId);
    
    console.log(`[parse] Found ${existingUploads?.length || 0} existing course_uploads records for ingestion ${ingestionId}`);
    
    // If no records exist, try to create them from storage
    if (!existingUploads || existingUploads.length === 0) {
      console.log(`[parse] No course_uploads records found, checking storage...`);
      
      // Get files from storage for this ingestion
      const storagePath = `${ingestion.course_id}/${ingestionId}/`;
      console.log(`[parse] Looking for files in storage path: ${storagePath}`);
      
      const { data: storageFiles, error: listError } = await supabase.storage
        .from('course-uploads')
        .list(storagePath);

      if (listError) {
        console.error('[parse.list-storage]', {
          message: listError.message || 'Unknown error',
          name: listError.name || 'Error',
          path: storagePath,
        });
      } else {
        console.log(`[parse] Found ${storageFiles?.length || 0} files in storage`);
      }

      // Create course_uploads records if they don't exist
      if (storageFiles && storageFiles.length > 0) {
        let createdCount = 0;
        for (const file of storageFiles) {
          if (file.name && !file.name.endsWith('/')) {
            const fullPath = `${storagePath}${file.name}`;
            
            // Determine mime type from file extension
            let mimeType = 'application/octet-stream';
            if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
            else if (file.name.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            else if (file.name.endsWith('.doc')) mimeType = 'application/msword';
            else if (file.name.endsWith('.txt')) mimeType = 'text/plain';
            else if (file.name.endsWith('.md')) mimeType = 'text/markdown';
            
            // Check if record already exists
            const { data: existing } = await supabase
              .from('course_uploads')
              .select('id')
              .eq('storage_path', fullPath)
              .eq('course_id', ingestion.course_id)
              .maybeSingle();
            
            if (!existing) {
              // Create upload record
              const { error: insertError } = await supabase
                .from('course_uploads')
                .insert({
                  ingestion_id: ingestionId,
                  course_id: ingestion.course_id,
                  storage_path: fullPath,
                  mime_type: mimeType,
                  meta: { filename: file.name, size: file.metadata?.size }
                });
              
              if (insertError) {
                console.error('[parse.create-upload-record]', {
                  message: insertError.message || 'Unknown error',
                  code: insertError.code || '',
                  details: insertError.details || '',
                  path: fullPath,
                });
              } else {
                createdCount++;
                console.log(`[parse] Created course_uploads record for ${file.name}`);
              }
            } else {
              console.log(`[parse] course_uploads record already exists for ${file.name}`);
              createdCount++; // Count it as available for parsing
            }
          }
        }
        console.log(`[parse] Created ${createdCount} course_uploads records from storage`);
      } else {
        console.warn(`[parse] No files found in storage at path: ${storagePath}`);
      }
    }

    // Check how many files we have to parse
    const { data: filesToParse, error: filesError } = await supabase
      .from('course_uploads')
      .select('id, storage_path, parsed_text, mime_type')
      .eq('course_id', ingestion.course_id)
      .eq('ingestion_id', ingestionId);
    
    if (filesError) {
      console.error('[parse] Error checking files:', filesError);
    } else {
      const unparsedCount = filesToParse?.filter(f => !f.parsed_text).length || 0;
      const alreadyParsedCount = filesToParse?.filter(f => f.parsed_text).length || 0;
      console.log(`[parse] Found ${filesToParse?.length || 0} files total: ${unparsedCount} to parse, ${alreadyParsedCount} already parsed`);
      
      // Verify files exist in storage before parsing
      if (filesToParse && filesToParse.length > 0) {
        console.log('[parse] Verifying files exist in storage...');
        const storagePath = `${ingestion.course_id}/${ingestionId}/`;
        const { data: storageFiles, error: verifyError } = await supabase.storage
          .from('course-uploads')
          .list(storagePath);
        
        if (verifyError) {
          console.error('[parse] Error verifying storage files:', verifyError);
        } else {
          console.log(`[parse] Found ${storageFiles?.length || 0} files in storage at path: ${storagePath}`);
          const storageFileNames = storageFiles?.map(f => f.name).filter(n => n && !n.endsWith('/')) || [];
          const dbFileNames = filesToParse.map(f => f.storage_path.split('/').pop()).filter(Boolean);
          
          console.log('[parse] Storage files:', storageFileNames);
          console.log('[parse] Database file paths:', filesToParse.map(f => f.storage_path));
          
          // Check for mismatches
          const missingInStorage = dbFileNames.filter(dbName => !storageFileNames.includes(dbName));
          if (missingInStorage.length > 0) {
            console.warn(`[parse] WARNING: ${missingInStorage.length} file(s) in database but not in storage:`, missingInStorage);
          }
        }
      }
    }
    
    // Parse all uploads for this ingestion
    console.log(`[parse] Starting to parse files for ingestion ${ingestionId}...`);
    const result = await parseUploads(ingestion.course_id, ingestionId, { useServiceClient: true });
    const { parsed, errors: parseErrors } = result;
    console.log(`[parse] Successfully parsed ${parsed.length} files. Errors: ${parseErrors.length}`);
    
    // Update ingestion status only if we parsed some files
    if (parsed.length > 0) {
      await supabase
        .from('ingestions')
        .update({ 
          status: 'EXTRACTING',
          updated_at: new Date().toISOString()
        })
        .eq('id', ingestionId);
    }

    // Get final count of files
    const { data: finalFiles } = await supabase
      .from('course_uploads')
      .select('id, storage_path, parsed_text')
      .eq('course_id', ingestion.course_id)
      .eq('ingestion_id', ingestionId);

    const unparsedFiles = finalFiles?.filter(f => !f.parsed_text) || [];
    const parsedFiles = finalFiles?.filter(f => f.parsed_text) || [];
    
    // Build detailed error message if there are errors
    let errorDetails = '';
    if (parseErrors.length > 0) {
      errorDetails = '\n\nFile-specific errors:\n' + parseErrors.map(e => `- ${e.file}: ${e.error}`).join('\n');
    }
    
    return NextResponse.json({ 
      ok: true, 
      parsedCount: parsed.length,
      totalFiles: finalFiles?.length || 0,
      alreadyParsed: parsedFiles.length,
      unparsedFiles: unparsedFiles.length,
      errors: parseErrors,
      parsed: parsed.map(p => ({
        uploadId: p.uploadId,
        source: p.source,
        textLength: p.text.length
      })),
      message: parsed.length === 0 
        ? `No files were parsed. ${finalFiles?.length || 0} files found in database. ${parsedFiles.length} already have parsed text, ${unparsedFiles.length} need parsing.${errorDetails}`
        : parsed.length === finalFiles?.length
        ? `Successfully parsed all ${parsed.length} file(s)!`
        : `Successfully parsed ${parsed.length} file(s). ${parseErrors.length} file(s) had errors.${errorDetails}`,
      warning: parsed.length === 0 && unparsedFiles.length > 0
        ? `Files exist but couldn't be parsed. See errors below.${errorDetails}`
        : parseErrors.length > 0
        ? `Some files had errors. See details below.${errorDetails}`
        : undefined
    });
  } catch (e: any) {
    // Extract error details
    const errorDetails: any = {
      message: e?.message || 'Unknown error',
      name: e?.name || 'Error',
    };
    
    if (e?.stack) errorDetails.stack = e.stack;
    
    console.error('[parse.route-catch]', errorDetails);
    
    return NextResponse.json(
      { 
        error: e?.message || 'Parse failed',
        details: errorDetails.message
      },
      { status: 500 }
    );
  }
}
