import { createClient } from './server';

/**
 * Mark a subunit as started
 */
export async function markSubunitStarted(
  subjectId: string,
  unitId: number,
  subUnitId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('mark_subunit_started', {
    p_subject_id: subjectId,
    p_unit_id: unitId,
    p_sub_unit_id: subUnitId,
  });

  if (error) {
    console.error('Error marking subunit started:', error);
    return false;
  }

  return true;
}

/**
 * Mark a subunit as finished
 */
export async function markSubunitFinished(
  subjectId: string,
  unitId: number,
  subUnitId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('mark_subunit_finished', {
    p_subject_id: subjectId,
    p_unit_id: unitId,
    p_sub_unit_id: subUnitId,
  });

  if (error) {
    console.error('Error marking subunit finished:', error);
    return false;
  }

  return true;
}

/**
 * Get user progress for a specific course
 */
export async function getUserProgress(subjectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('subject_id', subjectId);

  if (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }

  return data;
}

/**
 * Get user unit progress for a specific course
 */
export async function getUserUnitProgress(subjectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_unit_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('subject_id', subjectId);

  if (error) {
    console.error('Error fetching user unit progress:', error);
    return null;
  }

  return data;
}

