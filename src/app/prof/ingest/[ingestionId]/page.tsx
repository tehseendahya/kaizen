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
  const { data: ingestion } = await supabase
    .from('ingestions')
    .select(`
      id,
      status,
      error,
      created_at,
      updated_at,
      processing_started_at,
      processing_completed_at,
      courses (
        id,
        code,
        title
      )
    `)
    .eq('id', ingestionId)
    .single();

  if (!ingestion) {
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

