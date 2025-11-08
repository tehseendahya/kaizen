import { createClient } from './server';
import type { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  username: string;
  school: string | null;
  year: number | null;
  created_at: string;
};

/**
 * Get the current user's profile
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Create or update a user profile
 */
export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        ...updates,
      },
      {
        onConflict: 'id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    return null;
  }

  return data;
}

/**
 * Ensure a profile exists for the current user
 * Called after signup or when profile is missing
 */
export async function ensureProfile(user: User): Promise<Profile | null> {
  const supabase = await createClient();
  
  // Check if profile exists
  const existing = await getProfile(user.id);
  if (existing) return existing;

  // Create profile with default values
  const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
  
  return await upsertProfile(user.id, {
    username,
    school: null,
    year: null,
  });
}

