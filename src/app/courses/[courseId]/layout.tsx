import { notFound } from "next/navigation";
import { loadCourse } from "@/lib/courses/unified-loader";
import { createClient } from "@/lib/supabase/server";
import { courseContentV1ToUnified } from "@/lib/ingest/courseContentV1ToUnified";
import CourseLayoutClient from "./CourseLayoutClient";
import type { Course } from "@/lib/courses/unified-loader";
import type { CourseContentV1 } from "@/lib/course-schema";

// Check if string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  let course: Course | null = null;

  // If it's a UUID, try loading from database
  if (isUUID(courseId)) {
    const supabase = await createClient();
    
    const { data: dbCourse } = await supabase
      .from('courses')
      .select('id, title, code, description')
      .eq('id', courseId)
      .single();

    if (dbCourse) {
      const { data: draft } = await supabase
        .from('course_drafts')
        .select('content, schema_version')
        .eq('course_id', courseId)
        .single();

      if (draft?.content) {
        const draftData = typeof draft.content === 'string' 
          ? JSON.parse(draft.content) 
          : draft.content;
        
        try {
          course = courseContentV1ToUnified(
            draftData as CourseContentV1,
            courseId
          );
        } catch (error) {
          console.error('Error converting draft content:', error);
          course = {
            id: courseId,
            title: dbCourse.title || dbCourse.code || 'Untitled Course',
            description: dbCourse.description || '',
            units: [],
            lessons: [],
          };
        }
      } else {
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
    course = loadCourse(courseId);
  }

  if (!course) {
    notFound();
  }

  return <CourseLayoutClient course={course}>{children}</CourseLayoutClient>;
}

