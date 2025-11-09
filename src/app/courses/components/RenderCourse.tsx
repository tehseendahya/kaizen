/**
 * RenderCourse Component
 * Renders AI-generated course content using the standardized template
 */

'use client';

import { CourseContentV1 } from '@/lib/course-schema';
import { courseContentV1ToUnified } from '@/lib/ingest/courseContentV1ToUnified';
import UnitCard from '@/components/course/UnitCard';

export default function RenderCourse({ data }: { data: CourseContentV1 }) {
  // Debug logging
  console.log('[RenderCourse] Rendering course:', {
    hasData: !!data,
    hasCourseMeta: !!data?.courseMeta,
    unitsCount: data?.units?.length || 0,
    dataKeys: data ? Object.keys(data) : []
  });

  if (!data || !data.courseMeta) {
    console.error('[RenderCourse] Missing course data or courseMeta:', {
      hasData: !!data,
      hasCourseMeta: !!data?.courseMeta
    });
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-semibold mb-2">No course content available</p>
        <p className="text-sm">The course draft may be empty or invalid.</p>
      </div>
    );
  }

  // Convert CourseContentV1 to unified format
  let course;
  try {
    course = courseContentV1ToUnified(data, 'preview');
  } catch (error) {
    console.error('[RenderCourse] Error converting course:', error);
    return (
      <div className="p-8 text-center text-red-500">
        <p className="text-lg font-semibold mb-2">Error rendering course</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[1050px] space-y-6 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
        {course.description && <p className="mt-2 text-slate-600">{course.description}</p>}
      </div>
      {course.units?.sort((a: any, b: any) => a.number - b.number).map((u: any) => (
        <UnitCard key={u.number} unit={u} />
      ))}
    </main>
  );
}
