import { notFound } from "next/navigation";
import { loadCourse } from "@/lib/courses/unified-loader";
import { createClient } from "@/lib/supabase/server";
import { courseContentV1ToUnified } from "@/lib/ingest/courseContentV1ToUnified";
import Link from "next/link";
import type { Course } from "@/lib/courses/unified-loader";
import type { CourseContentV1 } from "@/lib/course-schema";

// Check if string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default async function CourseHome({ 
  params 
}: { 
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
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

  // Get first unit for "Up next"
  const firstUnit = course.units?.[0];
  const firstLesson = firstUnit?.sections?.[0] || course.lessons?.[0];

  return (
    <main className="mx-auto max-w-6xl py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome to {course.title}
        </h1>
        <p className="text-gray-600">
          Choose a lesson from the sidebar to get started
        </p>
      </div>

      {/* Up Next Card */}
      {firstUnit && (
        <div className="mb-8 border-l-4 border-blue-500 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {firstUnit.number}
            </div>
            <div className="flex-1">
              <div className="text-sm text-blue-700 font-medium mb-1">
                Up next for you:
              </div>
              <div className="text-xl font-bold text-gray-900">
                Unit {firstUnit.number}: {firstUnit.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About this unit */}
      {firstUnit && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About this unit
          </h2>
          
          {firstUnit.summary && (
            <p className="text-gray-700 mb-4">{firstUnit.summary}</p>
          )}

          {firstUnit.learningObjectives && firstUnit.learningObjectives.length > 0 && (
            <ul className="space-y-2 text-gray-700">
              {firstUnit.learningObjectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Topics in this unit */}
      {firstUnit && firstUnit.sections && firstUnit.sections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Topics in this unit
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {firstUnit.sections.map((section, idx) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {section.id} {section.title}
                    </h3>
                    {section.intro && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {section.intro}
                      </p>
                    )}
                  </div>
                </div>
                
                <Link
                  href={`/courses/${courseId}/${section.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Start learning
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Get Started Button */}
      {firstLesson && (
        <div className="flex justify-center">
          <Link
            href={`/courses/${courseId}/${firstLesson.slug}`}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get started
          </Link>
        </div>
      )}

      {/* All Units (collapsed view) */}
      {course.units && course.units.length > 1 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Units
          </h2>
          <div className="space-y-4">
            {course.units.map((unit) => (
              <div
                key={unit.number}
                className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
                    {unit.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Unit {unit.number}: {unit.title}
                    </h3>
                    {unit.summary && (
                      <p className="text-sm text-gray-600 mt-1">{unit.summary}</p>
                    )}
                  </div>
                </div>
                
                {unit.sections && unit.sections.length > 0 && (
                  <div className="mt-4 pl-14">
                    <div className="text-sm text-gray-500 mb-2">
                      {unit.sections.length} topic{unit.sections.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {unit.sections.map((section) => (
                        <Link
                          key={section.id}
                          href={`/courses/${courseId}/${section.slug}`}
                          className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                        >
                          {section.id}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
