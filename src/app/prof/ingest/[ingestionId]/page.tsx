import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import IngestionDetailClient from './IngestionDetailClient';

export default async function IngestionDetailPage({
  params,
}: {
  params: Promise<{ ingestionId: string }>;
}) {
  const { ingestionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/prof');
  }

  // Fetch ingestion with draft content
  // First try with the relation, if that fails, try without
  let { data: ingestion, error: ingestionError } = await supabase
    .from('ingestions')
    .select(`
      id,
      status,
      error,
      created_at,
      updated_at,
      course_id,
      courses (
        id,
        code,
        title
      )
    `)
    .eq('id', ingestionId)
    .single();

  // If the query with relation fails, try without the relation
  if (ingestionError || !ingestion) {
    console.warn('Initial query with relation failed, trying without relation:', {
      message: ingestionError?.message || 'Unknown',
      code: ingestionError?.code || '',
    });
    
    const { data: ingestionWithoutRelation, error: errorWithoutRelation } = await supabase
      .from('ingestions')
      .select('id, status, error, created_at, updated_at, course_id')
      .eq('id', ingestionId)
      .single();
    
    if (!errorWithoutRelation && ingestionWithoutRelation) {
      // Fetch course separately
      if (ingestionWithoutRelation.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('id, code, title')
          .eq('id', ingestionWithoutRelation.course_id)
          .single();
        
        ingestion = {
          ...ingestionWithoutRelation,
          courses: course || null,
        };
        ingestionError = null;
      } else {
        ingestion = ingestionWithoutRelation;
        ingestionError = null;
      }
    } else {
      ingestionError = errorWithoutRelation || ingestionError;
    }
  }

  if (ingestionError) {
    console.error('Error fetching ingestion:', {
      message: ingestionError.message || 'Unknown error',
      code: ingestionError.code || '',
      details: ingestionError.details || '',
      hint: ingestionError.hint || '',
    });
    notFound();
  }

  if (!ingestion) {
    console.error('Ingestion not found:', ingestionId);
    notFound();
  }

  // Fetch draft content from course_drafts (new schema)
  // This replaces the old draft_units/draft_subunits tables
  let draftContent = null;
  if (ingestion.course_id) {
    const { data: draft } = await supabase
      .from('course_drafts')
      .select('content, schema_version, updated_at')
      .eq('course_id', ingestion.course_id)
      .single();
    
    draftContent = draft?.content || null;
  }

  return (
    <IngestionDetailClient
      ingestion={ingestion}
      draftContent={draftContent}
      ingestionId={ingestionId}
    />
  );
}

