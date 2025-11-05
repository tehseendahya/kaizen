import { supabase } from '@/lib/supabase';


export interface Unit {
  id: number;
  title: string;
  subject_id: string; // Added for scalability
}

export interface SubunitContent {
  intuition: string | null;
  code_sketch: string | null;
  pitfalls: string | null;
  visual_model: string | null; 
}



export async function fetchUnits(subject_id: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('units')
    .select('id, title, subject_id')
    .eq('subject_id', subject_id) // Filter by the subject code
    .order('id', { ascending: true }); 

  if (error) {
    console.error(`Error fetching units for subject ${subject_id}:`, error);
    return []; 
  }
  
  return data || [];
}


export async function fetchSubunitContent(subunit_id: string): Promise<SubunitContent | null> {
  const { data, error } = await supabase
    .from('subunits')
    .select('intuition, code_sketch, pitfalls, visual_model') // Select the fields Gary needs
    .eq('sub_unit_id', subunit_id)
    .single();

  if (error) {
    console.error(`Error fetching content for subunit ${subunit_id}:`, error);
    return null;
  }
  
  return data as SubunitContent;
}