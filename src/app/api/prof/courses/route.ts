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
        createdError: createdError,
        profError: profError,
      });
      return NextResponse.json(
        {
          error: 'Failed to fetch courses',
          details: error?.message || error?.details || 'Unknown error',
          code: error?.code || '',
          hint: error?.hint || 'Check if courses and course_professors tables exist',
        },
        { status: 500 }
      );
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
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'You must be logged in to create a course',
          details: 'No user session found'
        }, 
        { status: 401 }
      );
    }

    // Verify professor role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });
      return NextResponse.json(
        {
          error: 'Failed to verify profile',
          message: profileError.message || 'Could not verify your profile',
          details: profileError.details || '',
          code: profileError.code || '',
          hint: profileError.hint || 'Make sure your profile exists',
        },
        { status: 500 }
      );
    }

    if (!profile || (profile.role !== 'professor' && profile.role !== 'admin')) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Only professors can create courses',
          details: `Your role is: ${profile?.role || 'unknown'}`,
          hint: 'Contact an administrator if you believe this is an error'
        }, 
        { status: 403 }
      );
    }

    // Parse request body with error handling
    let body: any;
    try {
      body = await request.json();
    } catch (jsonError: any) {
      console.error('Error parsing request body:', jsonError);
      return NextResponse.json(
        {
          error: 'Invalid request body',
          message: 'Failed to parse request body as JSON',
          details: jsonError?.message || 'Invalid JSON format',
        },
        { status: 400 }
      );
    }

    const { code, title, description } = body;

    if (!code || !title) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: 'Code and title are required',
          details: `Received: code=${code ? 'present' : 'missing'}, title=${title ? 'present' : 'missing'}`,
        },
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
      // Extract all error properties explicitly to avoid serialization issues
      const errorDetails: any = {};
      
      // Method 1: Direct property access (most reliable)
      if (error.message) errorDetails.message = String(error.message);
      if (error.code) errorDetails.code = String(error.code);
      if (error.details) errorDetails.details = String(error.details);
      if (error.hint) errorDetails.hint = String(error.hint);
      if (error.name) errorDetails.name = String(error.name);
      
      // Method 2: Try to get all own properties
      try {
        const ownProps = Object.getOwnPropertyNames(error);
        ownProps.forEach(prop => {
          if (!errorDetails[prop]) {
            try {
              const value = (error as any)[prop];
              if (value !== undefined && value !== null) {
                errorDetails[prop] = typeof value === 'object' ? JSON.stringify(value) : String(value);
              }
            } catch (e) {
              // Skip properties that can't be accessed
            }
          }
        });
      } catch (e) {
        // If we can't enumerate properties, continue with what we have
      }
      
      // Method 3: Try JSON.stringify as fallback
      try {
        const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
        if (errorString && errorString !== '{}') {
          errorDetails.rawJson = errorString;
        }
      } catch (e) {
        // JSON.stringify failed, that's okay
      }
      
      // Ensure we have at least one error message
      if (!errorDetails.message && !errorDetails.details) {
        errorDetails.message = String(error) || 'Unknown database error';
        errorDetails.details = errorDetails.message;
      }
      
      console.error('Error creating course:', errorDetails);
      
      // Build response with all available error information
      const responseError: any = {
        error: 'Failed to create course',
        message: errorDetails.message || errorDetails.details || 'Unknown error',
      };
      
      if (errorDetails.details) responseError.details = errorDetails.details;
      if (errorDetails.code) responseError.code = errorDetails.code;
      if (errorDetails.hint) responseError.hint = errorDetails.hint;
      if (errorDetails.rawJson) responseError.rawJson = errorDetails.rawJson;
      
      // Add helpful hint if it's a schema error
      if (errorDetails.message && (
        errorDetails.message.includes('full_name') || 
        errorDetails.message.includes('column') ||
        errorDetails.message.includes('constraint')
      )) {
        responseError.hint = 'Database schema issue. Please run the SQL fix: fix-full-name-constraint.sql';
      }
      
      return NextResponse.json(responseError, { status: 500 });
    }

    // Add professor to course_professors
    const { error: cpError } = await supabase.from('course_professors').insert({
      course_id: course.id,
      professor_id: user.id,
    });

    if (cpError) {
      console.error('Error adding professor to course_professors:', {
        message: cpError.message || 'Unknown error',
        code: cpError.code || '',
        details: cpError.details || '',
        hint: cpError.hint || '',
      });
      // Don't fail the request - course is created, just log the error
      // The professor can still access the course via created_by
    }

    return NextResponse.json(course);
  } catch (error: any) {
    console.error('Unexpected error in POST /api/prof/courses:', {
      message: error?.message || 'Unknown error',
      name: error?.name || 'Error',
      stack: error?.stack,
      error: error,
    });

    // Build detailed error response
    const errorResponse: any = {
      error: 'Internal server error',
      message: error?.message || 'An unexpected error occurred',
    };

    // Add additional details if available
    if (error?.code) errorResponse.code = String(error.code);
    if (error?.details) errorResponse.details = String(error.details);
    if (error?.hint) errorResponse.hint = String(error.hint);
    
    // In development, include stack trace
    if (process.env.NODE_ENV === 'development' && error?.stack) {
      errorResponse.stack = error.stack;
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

