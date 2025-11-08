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

  // Fetch draft units with subunits
  const { data: draftUnits } = await supabase
    .from('draft_units')
    .select(`
      id,
      index,
      title,
      summary,
      draft_subunits (
        id,
        index,
        title,
        intuition,
        worked_example,
        pitfalls,
        recap,
        code_sketch,
        references
      )
    `)
    .eq('ingestion_id', ingestionId)
    .order('index');

  return (
    <IngestionDetailClient
      ingestion={ingestion}
      draftUnits={draftUnits || []}
      ingestionId={ingestionId}
    />
  );
}

