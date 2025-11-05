
import { supabase } from '@/lib/supabase'; // Assuming you set up src/lib/supabase.ts
// We'll define a basic interface for type safety since you are using TypeScript
export interface Unit {
  id: number;
  title: string;
}


export async function fetchUnits(): Promise<Unit[]> {
  // Use .select('id, title') for a fast, light query
  const { data, error } = await supabase
    .from('units')
    .select('id, title')
    .order('id', { ascending: true }); // Order by the unit number

  if (error) {
    console.error('Error fetching units:', error);
    return []; 
  }
  
  return data || [];
}

export interface SubunitContent {
  intuition: string | null;
  code_sketch: string | null;
  pitfalls: string | null;
}

export async function fetchSubunitContent(subunit_id: string): Promise<SubunitContent | null> {
  const { data, error } = await supabase
    .from('subunits')
    .select('intuition, code_sketch, pitfalls') 
    .eq('sub_unit_id', subunit_id)
    .single();

  if (error) {
    console.error(`Error fetching content for subunit ${subunit_id}:`, error);
    return null;
  }
  
  return data;
}