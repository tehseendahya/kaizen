/**
 * Database functions for upserting Physics 152 course content
 */

import { createServiceClient } from '@/lib/supabase/service';

export async function ensureCourse(courseSlug: string, courseData: {
  title: string;
  description?: string;
  code?: string;
}) {
  const supabase = createServiceClient();
  
  // Check if course exists
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('code', courseData.code || courseSlug.toUpperCase())
    .maybeSingle();

  if (existing) {
    // Update if needed
    const { data: updated } = await supabase
      .from('courses')
      .update({
        title: courseData.title,
        description: courseData.description || courseData.title,
        code: courseData.code || courseSlug.toUpperCase(),
      })
      .eq('id', existing.id)
      .select()
      .single();
    
    return updated;
  }

  // Create new course
  // Note: We need a user ID - for now, we'll use a system user or make created_by nullable
  const { data: newCourse, error } = await supabase
    .from('courses')
    .insert({
      code: courseData.code || courseSlug.toUpperCase(),
      title: courseData.title,
      description: courseData.description || courseData.title,
      is_published: true, // Make it visible to students
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create course: ${error.message}`);
  }

  return newCourse;
}

export async function upsertLesson(
  courseId: string,
  lessonData: {
    slug: string;
    title: string;
    unit: string;
    unitOrder: number;
    order: number;
    content: {
      why: string;
      keyResults: string;
      example: string;
      pitfalls: string;
      checks: string;
    };
  }
) {
  const supabase = createServiceClient();
  
  const fullSlug = `${lessonData.unitOrder}-${lessonData.order}-${lessonData.slug}`;
  
  // Check if lesson exists (we'll store in a lessons table or use course_drafts)
  // For now, we'll use a simple approach: store in course_drafts as structured content
  
  // Since we're using the new unified format, we should create a lesson entry
  // that can be loaded by the course page
  
  // For Physics 152, we'll store lessons in a way that the course page can load them
  // This might require creating a lessons table or extending course_drafts
  
  // For now, return the lesson data structure that matches our Course type
  return {
    slug: fullSlug,
    title: `${lessonData.unitOrder}.${lessonData.order} ${lessonData.title}`,
    unitNumber: lessonData.unitOrder,
    keyConcepts: {
      overview: lessonData.content.why,
      bullets: lessonData.content.keyResults
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^\*\*/))
        .slice(0, 6), // Limit to 6 bullets
    },
    practice: [
      'Paraphrase the core idea of this lesson in your own words.',
      'Create a small example that demonstrates the concept.',
      'Explain one common misconception and why it\'s incorrect.',
    ],
    checks: lessonData.content.checks
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\(/))
      .map((check, i) => ({
        id: `check-${i + 1}`,
        prompt: check.replace(/^\d+\)\s*/, '').trim(),
        answer: '',
        type: 'short' as const,
      })),
    // Store additional content in metadata
    metadata: {
      example: lessonData.content.example,
      pitfalls: lessonData.content.pitfalls,
      keyResults: lessonData.content.keyResults,
    },
  };
}

