import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to ensure a user profile exists
 * Called after login/signup to create profile if missing
 * Uses service role client to bypass RLS when needed
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get optional role, username, and userId from request body
    let requestedRole: string | undefined; // Don't default to 'student' - only use if explicitly provided
    let requestedUsername: string | undefined;
    let userIdFromBody: string | undefined;
    let roleExplicitlyProvided = false;
    
    try {
      const body = await request.json();
      if (body && body.role) {
        requestedRole = body.role;
        roleExplicitlyProvided = true; // Mark that role was explicitly provided (signup flow)
      }
      if (body && body.username) {
        requestedUsername = body.username;
      }
      if (body && body.userId) {
        userIdFromBody = body.userId;
      }
    } catch (e) {
      // No body or invalid JSON - this is normal for login flow
      console.log('No body in request (login flow)');
    }
    
    // Get the user ID (from body for signup flow, or from session for login flow)
    let userId: string;
    
    if (userIdFromBody) {
      // User ID provided in body (signup flow)
      userId = userIdFromBody;
    } else {
      // Try to get from session (login flow)
      const {
        data: { user: sessionUser },
        error: authError,
      } = await supabase.auth.getUser();
      
      if (authError || !sessionUser) {
        return NextResponse.json(
          { 
            error: 'Not authenticated', 
            details: authError?.message || 'No user ID provided and no active session',
            hint: 'Provide userId in request body for signup flow'
          },
          { status: 401 }
        );
      }
      userId = sessionUser.id;
    }

    // Use service role client to bypass RLS for profile operations
    let serviceSupabase;
    try {
      serviceSupabase = createServiceClient();
    } catch (serviceError: any) {
      console.error('Failed to create service client:', serviceError);
      return NextResponse.json(
        {
          error: 'Service configuration error',
          details: serviceError?.message || 'Failed to initialize service client',
          hint: 'Check SUPABASE_SERVICE_ROLE_KEY environment variable',
        },
        { status: 500 }
      );
    }

    // Check if profile exists using service role (bypasses RLS)
    const { data: existingProfile, error: checkError } = await serviceSupabase
      .from('profiles')
      .select('id, role, username, school')
      .eq('id', userId)
      .maybeSingle();

    // Handle check error - if it's a "not found" error, that's OK, we'll create it
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine, but other errors are real problems
      console.error('Error checking profile:', {
        message: checkError.message,
        code: checkError.code,
        details: checkError.details,
        hint: checkError.hint,
      });
      
      const errorResponse = {
        error: 'Failed to check profile',
        details: checkError.message || checkError.details || 'Unknown error',
        code: checkError.code || 'UNKNOWN',
        hint: checkError.hint || '',
      };
      
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // If profile exists, update role/username if needed
    // IMPORTANT: Only update role if it was explicitly provided (signup flow)
    // During login, preserve existing role to prevent accidental role changes
    if (existingProfile) {
      const updates: { role?: string; username?: string; school?: string } = {};
      let needsUpdate = false;

      // Only update role if it was explicitly provided in the request (signup flow)
      // This prevents login from accidentally changing professor -> student
      if (roleExplicitlyProvided && requestedRole && existingProfile.role !== requestedRole) {
        updates.role = requestedRole;
        needsUpdate = true;
      }
      
      // Update username if provided and different
      if (requestedUsername && existingProfile.username !== requestedUsername) {
        updates.username = requestedUsername;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const { data: updatedProfile, error: updateError } = await serviceSupabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        
        if (!updateError && updatedProfile) {
          return NextResponse.json({ success: true, profile: updatedProfile });
        }
        console.error('Failed to update profile:', {
          message: updateError?.message,
          code: updateError?.code,
          details: updateError?.details,
          hint: updateError?.hint,
        });
        
        return NextResponse.json(
          { 
            error: 'Failed to update profile',
            details: updateError?.message || updateError?.details || 'Unknown error',
            code: updateError?.code || 'UNKNOWN',
            hint: updateError?.hint || '',
          },
          { status: 500 }
        );
      }
      // Profile exists and is already correct - return success
      // Role is preserved as-is (no accidental changes during login)
      return NextResponse.json({ success: true, profile: existingProfile });
    }

    // Profile doesn't exist, create it using service role client
    // Use requested username or generate one from userId
    const username = requestedUsername || `user_${userId.slice(0, 8)}`;
    
    // Default to 'student' if no role was provided (shouldn't happen in normal flow, but safe fallback)
    const roleToCreate = requestedRole || 'student';
    
    const { data: newProfile, error: createError } = await serviceSupabase
      .from('profiles')
      .insert({
        id: userId,
        username: username,
        role: roleToCreate,
      })
      .select()
      .single();

    if (createError) {
      console.error('Profile creation error:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint,
      });
      
      // Serialize error properly
      const errorResponse = {
        error: 'Failed to create profile',
        details: createError.message || createError.details || 'Unknown error',
        code: createError.code || 'UNKNOWN',
        hint: createError.hint || '',
      };
      
      return NextResponse.json(errorResponse, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: newProfile });
  } catch (error: any) {
    console.error('Unexpected error in ensure profile:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorDetails = {
      error: 'Internal server error',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    };
    return NextResponse.json(errorDetails, { status: 500 });
  }
}

