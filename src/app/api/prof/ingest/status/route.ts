import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/prof/ingest/status?ingestionId=...
 * Get current status of an ingestion
 */
export async function GET(request: NextRequest) {
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

    // Fetch ingestion with course info
    const { data: ingestion, error } = await supabase
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

    if (error || !ingestion) {
      return NextResponse.json({ error: 'Ingestion not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'professor' && profile.role !== 'admin')) {
      // Check if user created it
      const { data: check } = await supabase
        .from('ingestions')
        .select('created_by')
        .eq('id', ingestionId)
        .eq('created_by', user.id)
        .single();

      if (!check) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Count draft units
    const { count: unitCount } = await supabase
      .from('draft_units')
      .select('*', { count: 'exact', head: true })
      .eq('ingestion_id', ingestionId);

    // Get unit IDs for subunit count
    const { data: unitIds } = await supabase
      .from('draft_units')
      .select('id')
      .eq('ingestion_id', ingestionId);

    let subunitCount = 0;
    if (unitIds && unitIds.length > 0) {
      const unitIdArray = unitIds.map(u => u.id);
      const { count } = await supabase
        .from('draft_subunits')
        .select('*', { count: 'exact', head: true })
        .in('unit_id', unitIdArray);
      subunitCount = count || 0;
    }

    return NextResponse.json({
      ...ingestion,
      stats: {
        draftUnits: unitCount || 0,
        draftSubunits: subunitCount || 0,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

