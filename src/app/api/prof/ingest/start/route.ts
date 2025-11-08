import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { processIngestion } from '@/lib/processing/ingest';

/**
 * POST /api/prof/ingest/start?ingestionId=...
 * Start processing an ingestion (triggers server-side processing)
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

    const ingestionId = request.nextUrl.searchParams.get('ingestionId');
    if (!ingestionId) {
      return NextResponse.json({ error: 'ingestionId is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: ingestion } = await supabase
      .from('ingestions')
      .select('id, course_id, created_by, status')
      .eq('id', ingestionId)
      .single();

    if (!ingestion) {
      return NextResponse.json({ error: 'Ingestion not found' }, { status: 404 });
    }

    if (ingestion.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update status to EXTRACTING and trigger processing
    await supabase
      .from('ingestions')
      .update({ 
        status: 'EXTRACTING',
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', ingestionId);

    // Trigger processing asynchronously
    // In production, use a job queue or Edge Function
    processIngestion(ingestionId).catch((error) => {
      console.error('Processing error:', error);
    });

    return NextResponse.json({ success: true }, { status: 202 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

