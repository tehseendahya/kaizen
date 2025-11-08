import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function ProfCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch courses where user is professor
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, code, title, description, is_published, created_at')
    .or(`created_by.eq.${user.id},id.in.(SELECT course_id FROM course_professors WHERE professor_id.eq.${user.id})`)
    .order('created_at', { ascending: false });

  if (error) {
    // Extract all error properties explicitly to avoid serialization issues
    const errorDetails: any = {
      message: error.message || 'Unknown error',
      code: error.code || '',
      details: error.details || '',
      hint: error.hint || '',
    };
    
    // Try to extract any additional properties
    if (error.name) errorDetails.name = error.name;
    if (error.stack) errorDetails.stack = error.stack;
    
    // Log the structured error
    console.error('Error fetching courses:', errorDetails);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">Manage your courses</p>
        </div>
        <Link href="/prof/ingest/new">
          <Button>New Ingestion</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses && courses.length > 0 ? (
          courses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
                  <p className="text-gray-600">{course.title}</p>
                </div>
                <Badge className={course.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {course.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              {course.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
              )}
              <Link href={`/prof/ingest/new?courseId=${course.id}`}>
                <Button variant="outline" className="w-full">
                  Upload Content
                </Button>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No courses yet</p>
            <Link href="/prof/ingest/new">
              <Button>Create Your First Course</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

