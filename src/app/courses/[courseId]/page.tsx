/**
 * Course Page - Student View with Professor Preview Support
 * Shows published content to students, draft preview to professors
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RenderCourse from '../components/RenderCourse';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function CoursePage({ 
  params, 
  searchParams 
}: { 
  params: { courseId: string };
  searchParams: { preview?: string };
}) {
  const supabase = await createClient();
  const preview = searchParams?.preview === '1';
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, created_by, status, title, code, is_published')
    .eq('id', params.courseId)
    .single();
  
  if (courseError || !course) {
    console.error('[CoursePage] Course not found:', {
      courseId: params.courseId,
      error: courseError?.message
    });
    redirect('/courses');
  }

  // Handle preview mode (professor only)
  if (preview) {
    // Must be authenticated and own the course
    if (!user || user.id !== course.created_by) {
      redirect(`/courses/${params.courseId}`);
    }

    // Get the draft
    const { data: draft, error: draftError } = await supabase
      .from('course_drafts')
      .select('content, schema_version, updated_at')
      .eq('course_id', course.id)
      .single();

    if (draftError) {
      console.error('[CoursePage] Error fetching draft:', {
        courseId: course.id,
        error: draftError?.message,
        code: draftError?.code,
        details: draftError?.details
      });
      redirect(`/courses/${params.courseId}`);
    }

    if (!draft?.content) {
      console.error('[CoursePage] No draft content available:', {
        courseId: course.id,
        hasDraft: !!draft,
        schemaVersion: draft?.schema_version
      });
      redirect(`/courses/${params.courseId}`);
    }

    // Validate draft content structure
    const draftContent = draft.content;
    console.log('[CoursePage] Draft content structure:', {
      hasCourseMeta: !!draftContent.courseMeta,
      unitsCount: draftContent.units?.length || 0,
      totalLessons: draftContent.units?.reduce((sum: number, u: any) => sum + (u.lessons?.length || 0), 0) || 0,
      schemaVersion: draft.schema_version
    });

    // Check if content is actually populated
    if (!draftContent.units || draftContent.units.length === 0) {
      console.error('[CoursePage] Draft has no units:', {
        courseId: course.id,
        contentKeys: Object.keys(draftContent)
      });
      
      // Show helpful message if draft is empty
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-5xl mx-auto p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-900 mb-2">
                Draft Generated But Empty
              </h2>
              <p className="text-yellow-800 mb-4">
                The course draft was generated, but it appears to be empty. This usually happens when:
              </p>
              <ul className="list-disc list-inside text-yellow-800 space-y-1 mb-4">
                <li>The source materials were too brief or didn't contain extractable content</li>
                <li>The AI couldn't parse the materials properly</li>
                <li>There was an issue during content generation</li>
              </ul>
              <div className="flex gap-3">
                <Link href={`/prof/ingest`}>
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href={`/prof/ingest/new`}>
                  <Button>
                    Try Again with Different Materials
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render preview with publish button
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview Header */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-yellow-600">PREVIEW MODE</Badge>
              <span className="text-sm text-yellow-800">
                You are viewing the draft version of this course
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/prof/ingest`}>
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href={`/courses/${course.id}`}>
                <Button variant="outline" size="sm">
                  View Published
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <RenderCourse data={draft.content} />

        {/* Publish Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <form action={`/api/prof/courses/${course.id}/publish`} method="POST">
            <Button 
              type="submit"
              size="lg"
              className="shadow-lg bg-green-600 hover:bg-green-700"
            >
              Publish Course
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Regular student/public view
  // Check if course is published
  if (course.status !== 'PUBLISHED' || !course.is_published) {
    // If the owner is viewing, suggest preview mode
    if (user && user.id === course.created_by) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Course Not Published
            </h1>
            <p className="text-gray-600">
              This course is not yet available to students.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/courses/${course.id}?preview=1`}>
                <Button>Preview Draft</Button>
              </Link>
              <Link href="/prof">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    // Non-owners can't see unpublished courses
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Course Not Available
          </h1>
          <p className="text-gray-600">
            This course is not yet published.
          </p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get published content
  const { data: published, error: publishedError } = await supabase
    .from('course_published')
    .select('content, schema_version, published_at')
    .eq('course_id', course.id)
    .single();

  if (publishedError || !published?.content) {
    console.error('[CoursePage] No published content:', {
      courseId: course.id,
      error: publishedError?.message
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Content Not Available
          </h1>
          <p className="text-gray-600">
            The course content is being prepared.
          </p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render published content for students
  return (
    <div className="min-h-screen bg-gray-50">
      {/* If professor is viewing their published course, show edit option */}
      {user && user.id === course.created_by && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="text-sm text-blue-800">
              You are viewing the published version
            </span>
            <div className="flex items-center gap-2">
              <Link href={`/courses/${course.id}?preview=1`}>
                <Button variant="outline" size="sm">
                  Preview Draft
                </Button>
              </Link>
              <Link href={`/prof`}>
                <Button variant="outline" size="sm">
                  Professor Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <RenderCourse data={published.content} />
    </div>
  );
}
