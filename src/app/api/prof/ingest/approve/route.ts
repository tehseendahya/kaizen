import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * POST /api/prof/ingest/approve?ingestionId=...
 * Approve and publish an ingestion
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

    // Verify ownership and status
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

    if (ingestion.status !== 'READY_FOR_REVIEW') {
      return NextResponse.json(
        { error: `Ingestion is not ready for review. Current status: ${ingestion.status}` },
        { status: 400 }
      );
    }

    // Use service client for transaction
    const serviceClient = createServiceClient();

    // Fetch draft units and subunits
    const { data: draftUnits } = await serviceClient
      .from('draft_units')
      .select('*, draft_subunits(*)')
      .eq('ingestion_id', ingestionId)
      .order('index');

    if (!draftUnits || draftUnits.length === 0) {
      return NextResponse.json({ error: 'No draft content found' }, { status: 400 });
    }

    // Transaction: Publish to live tables
    // 1. Create/update live units
    const liveUnits = [];
    for (const draftUnit of draftUnits) {
      const { data: liveUnit } = await serviceClient
        .from('units_live')
        .upsert({
          course_id: ingestion.course_id,
          index: draftUnit.index,
          title: draftUnit.title,
          summary: draftUnit.summary || null,
        }, {
          onConflict: 'course_id,index',
        })
        .select()
        .single();

      if (liveUnit) {
        liveUnits.push(liveUnit);

        // 2. Create/update live subunits
        const draftSubunits = draftUnit.draft_subunits || [];
        for (const draftSubunit of draftSubunits) {
          await serviceClient
            .from('subunits_live')
            .upsert({
              unit_id: liveUnit.id,
              index: draftSubunit.index,
              title: draftSubunit.title,
              intuition: draftSubunit.intuition,
              worked_example: draftSubunit.worked_example,
              pitfalls: draftSubunit.pitfalls,
              recap: draftSubunit.recap,
              code_sketch: draftSubunit.code_sketch || null,
              references: draftSubunit.references || null,
            }, {
              onConflict: 'unit_id,index',
            });
        }
      }
    }

    // 3. Update ingestion status
    await serviceClient
      .from('ingestions')
      .update({
        status: 'PUBLISHED',
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', ingestionId);

    // 4. Mark course as published
    await serviceClient
      .from('courses')
      .update({ is_published: true })
      .eq('id', ingestion.course_id);

    // 5. Revalidate cache
    revalidateTag(`course:${ingestion.course_id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

