import { createServiceClient } from '@/lib/supabase/service';
import { extractFromBuffer } from './text';
import { getAiClient } from '@/lib/ai';
import { buildOrganizerPrompt, buildEnricherPrompt } from '@/lib/ai/prompts';
import { CurriculumSchema } from '@/lib/ai/schemas';

/**
 * Process an ingestion: extract files, organize with AI, enrich subunits
 */
export async function processIngestion(ingestionId: string) {
  const supabase = createServiceClient();

  try {
    // 1. Get ingestion
    const { data: ingestion } = await supabase
      .from('ingestions')
      .select('id, course_id, created_by, courses(code, title, description)')
      .eq('id', ingestionId)
      .single();

    if (!ingestion) {
      throw new Error('Ingestion not found');
    }

    // 2. List files from storage
    const { data: files } = await supabase.storage
      .from('course-uploads')
      .list(`${ingestion.course_id}/${ingestionId}`, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (!files || files.length === 0) {
      throw new Error('No files found for ingestion');
    }

    // 3. Extract text from all files
    const fileSnippets: Array<{ filename: string; content: string }> = [];
    
    for (const file of files) {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('course-uploads')
        .download(`${ingestion.course_id}/${ingestionId}/${file.name}`);

      if (downloadError || !fileData) {
        console.error(`Error downloading ${file.name}:`, downloadError);
        continue;
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const extracted = await extractFromBuffer(buffer, file.name);
        fileSnippets.push({
          filename: file.name,
          content: extracted.text,
        });
      } catch (extractError) {
        console.error(`Error extracting ${file.name}:`, extractError);
        continue;
      }
    }

    if (fileSnippets.length === 0) {
      throw new Error('No files could be extracted');
    }

    // 4. Update status to AI_STRUCTURING
    await supabase
      .from('ingestions')
      .update({ status: 'AI_STRUCTURING' })
      .eq('id', ingestionId);

    // 5. Call AI Organizer
    const course = ingestion.courses as any;
    const organizerPrompt = buildOrganizerPrompt(
      {
        code: course.code,
        title: course.title,
        description: course.description,
      },
      fileSnippets
    );

    const aiClient = getAiClient('gemini');
    const curriculum = await aiClient.organizeCurriculum(organizerPrompt);

    // Validate with Zod
    const validated = CurriculumSchema.parse(curriculum);

    // 6. Save draft units
    for (const unit of validated.units) {
      const { data: draftUnit } = await supabase
        .from('draft_units')
        .insert({
          ingestion_id: ingestionId,
          course_id: ingestion.course_id,
          index: unit.index,
          title: unit.title,
          summary: unit.summary || null,
        })
        .select()
        .single();

      if (!draftUnit) continue;

      // 7. Enrich and save draft subunits
      for (const subunit of unit.subunits) {
        // Enrich with AI
        const enricherPrompt = buildEnricherPrompt({
          title: subunit.title,
          raw_text: subunit.raw_text,
          unitTitle: unit.title,
          courseCode: course.code,
        });

        const enriched = await aiClient.enrichSubunit(enricherPrompt);

        await supabase.from('draft_subunits').insert({
          unit_id: draftUnit.id,
          index: subunit.index,
          title: subunit.title,
          raw_text: subunit.raw_text || null,
          intuition: enriched.intuition,
          worked_example: enriched.worked_example,
          pitfalls: enriched.pitfalls,
          recap: enriched.recap,
          code_sketch: enriched.code_sketch,
          references: enriched.references,
        });
      }
    }

    // 8. Mark as READY_FOR_REVIEW
    await supabase
      .from('ingestions')
      .update({
        status: 'READY_FOR_REVIEW',
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', ingestionId);

    return { success: true };
  } catch (error) {
    // Mark as FAILED
    await supabase
      .from('ingestions')
      .update({
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', ingestionId);

    throw error;
  }
}

