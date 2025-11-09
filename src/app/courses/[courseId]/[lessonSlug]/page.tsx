import { notFound } from "next/navigation";
import { loadCourse } from "@/lib/courses/unified-loader";
import { createClient } from "@/lib/supabase/server";
import { courseContentV1ToUnified } from "@/lib/ingest/courseContentV1ToUnified";
import ActionBar from "@/components/course/ActionBar";
import { KeyConceptsCard, PracticeCard } from "@/components/course/KeyPracticeCheck";
import Assessments from "@/components/course/Assessments";
import type { Course } from "@/lib/courses/unified-loader";
import type { CourseContentV1 } from "@/lib/course-schema";

// Check if string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default async function LessonPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; lessonSlug: string }>;
}) {
  const { courseId, lessonSlug } = await params;
  let course: Course | null = null;

  // If it's a UUID, try loading from database
  if (isUUID(courseId)) {
    const supabase = await createClient();
    
    // Get course info
    const { data: dbCourse } = await supabase
      .from('courses')
      .select('id, title, code, description')
      .eq('id', courseId)
      .single();

    if (dbCourse) {
      // Try to get draft content
      const { data: draft } = await supabase
        .from('course_drafts')
        .select('content, schema_version')
        .eq('course_id', courseId)
        .single();

      if (draft?.content) {
        // Draft content is stored as CourseContentV1 format
        const draftData = typeof draft.content === 'string' 
          ? JSON.parse(draft.content) 
          : draft.content;
        
        // Convert from CourseContentV1 to unified format
        try {
          course = courseContentV1ToUnified(
            draftData as CourseContentV1,
            courseId
          );
        } catch (error) {
          console.error('Error converting draft content:', error);
          // Create minimal course structure on error
          course = {
            id: courseId,
            title: dbCourse.title || dbCourse.code || 'Untitled Course',
            description: dbCourse.description || '',
            units: [],
            lessons: [],
          };
        }
      } else {
        // No draft content, create minimal course structure
        course = {
          id: courseId,
          title: dbCourse.title || dbCourse.code || 'Untitled Course',
          description: dbCourse.description || '',
          units: [],
          lessons: [],
        };
      }
    }
  } else {
    // Try loading from YAML
    course = loadCourse(courseId);
  }

  if (!course) {
    notFound();
  }

  // source of truth: lessons[]; fallback to section
  const lesson = course.lessons?.find((l: any) => l.slug === lessonSlug);
  const section = course.units?.flatMap((u: any) => u.sections ?? []).find((s: any) => s.slug === lessonSlug);
  const title = lesson?.title ?? section?.title ?? "Lesson";

  const keyOverview = lesson?.keyConcepts?.overview ?? section?.intro ?? "";
  const keyBullets = lesson?.keyConcepts?.bullets ?? (course.units?.find((u: any) => u.sections?.some((s: any) => s.slug === lessonSlug))?.learningObjectives ?? []);
  const checks = lesson?.checks ?? section?.assessments ?? [];

  return (
    <div className="mx-auto max-w-[1100px] py-8 px-4">
      <main className="space-y-5">
        <h1 className="text-3xl font-bold">{title}</h1>
        <ActionBar />

        <KeyConceptsCard overview={keyOverview} bullets={keyBullets} />
        <PracticeCard items={lesson?.practice ?? []} />
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-lg font-semibold">Check Your Understanding</div>
          <div className="mt-3"><Assessments items={checks} label="Questions" /></div>
        </div>
      </main>
    </div>
  );
}
