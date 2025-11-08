import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/prof/courses
 * List courses for the authenticated professor
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

    // Verify professor role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'professor' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch courses where user is professor
    // Get courses created by user
    const { data: createdCourses, error: createdError } = await supabase
      .from('courses')
      .select('id, code, title, description, is_published, created_at')
      .eq('created_by', user.id);

    // Get course IDs from course_professors table
    const { data: professorCourses, error: profError } = await supabase
      .from('course_professors')
      .select('course_id')
      .eq('professor_id', user.id);

    if (createdError || profError) {
      const error = createdError || profError;
      console.error('Error fetching courses:', {
        message: error?.message || 'Unknown error',
        code: error?.code || '',
        details: error?.details || '',
        hint: error?.hint || '',
      });
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }

    // Get additional courses from course_professors
    const professorCourseIds = professorCourses?.map(cp => cp.course_id) || [];
    let additionalCourses: any[] = [];

    if (professorCourseIds.length > 0) {
      const { data: profCoursesData, error: profCoursesError } = await supabase
        .from('courses')
        .select('id, code, title, description, is_published, created_at')
        .in('id', professorCourseIds);

      if (!profCoursesError && profCoursesData) {
        additionalCourses = profCoursesData;
      }
    }

    // Combine and deduplicate courses
    const allCourses = [...(createdCourses || []), ...additionalCourses];
    const uniqueCourses = Array.from(
      new Map(allCourses.map(course => [course.id, course])).values()
    );

    // Sort by id (descending) as fallback if created_at not available
    // Most recent courses will have higher UUIDs
    uniqueCourses.sort((a, b) => {
      if (a.created_at && b.created_at) {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return bDate - aDate;
      }
      // Fallback: sort by id (string comparison)
      return b.id.localeCompare(a.id);
    });

    // Always return an array
    return NextResponse.json(uniqueCourses);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prof/courses
 * Create a new course
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

    // Verify professor role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'professor' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { code, title, description } = body;

    if (!code || !title) {
      return NextResponse.json(
        { error: 'Code and title are required' },
        { status: 400 }
      );
    }

    // Create course
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        code,
        title,
        description: description || null,
        created_by: user.id,
        is_published: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }

    // Add professor to course_professors
    await supabase.from('course_professors').insert({
      course_id: course.id,
      professor_id: user.id,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

