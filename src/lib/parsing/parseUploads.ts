/**
 * Parse uploaded files into text
 * Handles PDF, DOCX, and text files
 * Uses the same error extraction patterns as other parts of the app
 */

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import mammoth from 'mammoth';
import { parsePdf } from './pdf-parse-wrapper';

export type ParsedUpload = { 
  uploadId: string; 
  source: string; 
  text: string;
};

export async function parseUploads(
  courseId: string, 
  ingestionId?: string,
  options?: { useServiceClient?: boolean }
): Promise<{ parsed: ParsedUpload[]; errors: Array<{ file: string; error: string }> }> {
  // Use service client for storage operations to bypass RLS if needed
  // Regular client for database operations (respects RLS)
  const supabase = await createClient();
  
  let serviceSupabase = supabase;
  if (options?.useServiceClient) {
    try {
      serviceSupabase = createServiceClient();
      console.log('[parseUploads] Using service client for storage operations');
    } catch (serviceError: any) {
      console.warn('[parseUploads] Failed to create service client, using regular client:', serviceError?.message);
      // Continue with regular client
    }
  }
  
  const out: ParsedUpload[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  // Fetch uploads for this course (optionally filtered by ingestion_id)
  let query = supabase
    .from('course_uploads')
    .select('id, storage_path, mime_type, meta, parsed_text')
    .eq('course_id', courseId);
  
  if (ingestionId) {
    query = query.eq('ingestion_id', ingestionId);
  }
  
  const { data: uploads, error: selErr } = await query;

  if (selErr) {
    // Use the same error extraction pattern as other parts of the app
    const errorDetails: any = {};
    if (selErr.message) errorDetails.message = String(selErr.message);
    if (selErr.code) errorDetails.code = String(selErr.code);
    if (selErr.details) errorDetails.details = String(selErr.details);
    if (selErr.hint) errorDetails.hint = String(selErr.hint);
    
    console.error('[parseUploads.select]', errorDetails);
    throw new Error(selErr.message || 'Failed to load uploads');
  }

  console.log(`[parseUploads] Processing ${uploads?.length || 0} uploads for course ${courseId}${ingestionId ? `, ingestion ${ingestionId}` : ''}`);
  
  for (const u of uploads ?? []) {
    console.log(`[parseUploads] Processing file: ${u.storage_path} (mime: ${u.mime_type}, id: ${u.id})`);
    
    // Skip if already parsed
    if (u.parsed_text) {
      console.log(`[parseUploads] File ${u.storage_path} already parsed, skipping`);
      out.push({ 
        uploadId: u.id, 
        source: u.storage_path, 
        text: u.parsed_text 
      });
      continue;
    }

    console.log(`[parseUploads] Downloading file from storage: ${u.storage_path}`);
    
    // Try downloading with regular client first, fallback to service client if RLS fails
    let fileData: Blob | null = null;
    let dlErr: any = null;
    
    const { data: data1, error: err1 } = await supabase.storage
      .from('course-uploads')
      .download(u.storage_path);
    
    if (err1) {
      console.warn(`[parseUploads] Regular client failed, trying service client for ${u.storage_path}:`, err1.message);
      // Try with service client to bypass RLS
      const { data: data2, error: err2 } = await serviceSupabase.storage
        .from('course-uploads')
        .download(u.storage_path);
      fileData = data2;
      dlErr = err2;
    } else {
      fileData = data1;
    }

    if (dlErr) {
      const errorDetails: any = {
        path: u.storage_path,
        message: dlErr.message || 'Unknown error',
        name: dlErr.name || 'Error',
      };
      
      // Try to get all properties
      try {
        const ownProps = Object.getOwnPropertyNames(dlErr);
        ownProps.forEach(prop => {
          if (!errorDetails[prop]) {
            try {
              const value = (dlErr as any)[prop];
              if (value !== undefined && value !== null) {
                errorDetails[prop] = typeof value === 'object' ? JSON.stringify(value) : String(value);
              }
            } catch (e) {
              // Skip properties that can't be accessed
            }
          }
        });
      } catch (e) {
        // Continue
      }
      
      const errorMsg = `Failed to download from storage: ${errorDetails.message || 'Unknown error'}. Path: ${u.storage_path}`;
      console.error(`[parseUploads.download] FAILED to download ${u.storage_path}:`, errorDetails);
      errors.push({ file: u.storage_path, error: errorMsg });
      continue; // Skip this file but continue with others
    }
    
    if (!fileData) {
      const errorMsg = `No file data returned from storage. Path: ${u.storage_path}`;
      console.error(`[parseUploads.download] No file data returned for ${u.storage_path}`);
      errors.push({ file: u.storage_path, error: errorMsg });
      continue;
    }
    
    console.log(`[parseUploads] Successfully downloaded ${u.storage_path}, size: ${fileData.size || 'unknown'}`);

    try {
      let text = '';
      console.log(`[parseUploads] Parsing ${u.mime_type} file: ${u.storage_path}`);
      
      if (u.mime_type === 'application/pdf') {
        // Parse PDF using wrapper for CommonJS/ESM compatibility
        console.log(`[parseUploads] Parsing PDF: ${u.storage_path}`);
        const buf = await fileData.arrayBuffer();
        const parsed = await parsePdf(Buffer.from(buf));
        text = parsed.text || '';
        console.log(`[parseUploads] PDF parsed, extracted ${text.length} characters`);
      } else if (
        u.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        u.mime_type === 'application/msword'
      ) {
        // Parse DOCX
        console.log(`[parseUploads] Parsing DOCX: ${u.storage_path}`);
        const buf = await fileData.arrayBuffer();
        const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
        text = value || '';
        console.log(`[parseUploads] DOCX parsed, extracted ${text.length} characters`);
      } else if (
        u.mime_type === 'text/plain' ||
        u.mime_type === 'text/markdown' ||
        u.mime_type?.startsWith('text/')
      ) {
        // Parse text files
        console.log(`[parseUploads] Parsing text file: ${u.storage_path}`);
        text = await fileData.text();
        console.log(`[parseUploads] Text file parsed, extracted ${text.length} characters`);
      } else {
        // Fallback: try to read as text
        console.log(`[parseUploads] Unknown mime type ${u.mime_type}, trying to read as text: ${u.storage_path}`);
        try {
          text = await fileData.text();
          console.log(`[parseUploads] Fallback text parsing succeeded, extracted ${text.length} characters`);
        } catch (e) {
          console.error(`[parseUploads] Could not parse file type ${u.mime_type} for ${u.storage_path}:`, e);
          continue;
        }
      }

      if (!text || text.trim().length === 0) {
        const errorMsg = `No text extracted from file. File may be empty or unsupported format.`;
        console.warn(`[parseUploads] Warning: No text extracted from ${u.storage_path}`);
        // Don't add to errors - empty files are valid, just skip saving
        continue;
      }

      // Update the database with parsed text
      console.log(`[parseUploads] Saving parsed text to database for ${u.storage_path} (${text.length} chars)`);
      const { error: upErr } = await supabase
        .from('course_uploads')
        .update({ parsed_text: text })
        .eq('id', u.id);

      if (upErr) {
        const errorDetails: any = {};
        if (upErr.message) errorDetails.message = String(upErr.message);
        if (upErr.code) errorDetails.code = String(upErr.code);
        if (upErr.details) errorDetails.details = String(upErr.details);
        if (upErr.hint) errorDetails.hint = String(upErr.hint);
        
        const errorMsg = `Failed to save parsed text to database: ${errorDetails.message || 'Unknown error'}`;
        console.error(`[parseUploads.update] FAILED to save parsed text for ${u.storage_path}:`, errorDetails);
        errors.push({ file: u.storage_path, error: errorMsg });
        continue;
      }
      
      console.log(`[parseUploads] Successfully parsed and saved ${u.storage_path}`);
      out.push({ 
        uploadId: u.id, 
        source: u.storage_path, 
        text 
      });
    } catch (e: any) {
      const errorDetails: any = {
        message: e?.message || 'Unknown parse error',
        name: e?.name || 'Error',
        uploadId: u.id,
        path: u.storage_path,
        mimeType: u.mime_type,
      };
      
      if (e?.stack) errorDetails.stack = e.stack;
      
      const errorMsg = `Parse error: ${errorDetails.message || 'Unknown error'}. File type: ${u.mime_type}`;
      console.error(`[parseUploads.parse-catch] FAILED to parse ${u.storage_path}:`, errorDetails);
      errors.push({ file: u.storage_path, error: errorMsg });
      // Keep going for other files
    }
  }
  
  console.log(`[parseUploads] Completed parsing. Successfully parsed ${out.length} out of ${uploads?.length || 0} files. Errors: ${errors.length}`);
  return { parsed: out, errors };
}
