import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to ensure a user profile exists
 * Called after login/signup to create profile if missing
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get optional role from request body
    let requestedRole = 'student';
    try {
      const body = await request.json();
      if (body && body.role) {
        requestedRole = body.role;
      }
    } catch {
      // No body or invalid JSON - use default 'student'
    }

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, role, username')
      .eq('id', user.id)
      .single();

    // If profile exists, update role if needed
    if (existingProfile && !checkError) {
      // If role is different from requested, update it
      if (requestedRole !== 'student' && existingProfile.role !== requestedRole) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ role: requestedRole })
          .eq('id', user.id)
          .select()
          .single();
        
        if (!updateError && updatedProfile) {
          return NextResponse.json({ success: true, profile: updatedProfile });
        }
      }
      return NextResponse.json({ success: true, profile: existingProfile });
    }

    // Profile doesn't exist, create it
    const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: username,
        role: requestedRole === 'professor' ? 'professor' : 'student',
      })
      .select()
      .single();

    if (createError) {
      console.error('Profile creation error:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create profile',
          details: createError.message,
          code: createError.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile: newProfile });
  } catch (error: any) {
    console.error('Unexpected error in ensure profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

