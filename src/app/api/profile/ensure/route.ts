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

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile exists, return it
    if (existingProfile && !checkError) {
      return NextResponse.json({ success: true, profile: existingProfile });
    }

    // Profile doesn't exist, create it
    const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: username,
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

