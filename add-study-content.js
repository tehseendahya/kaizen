// 1. SUPABASE SETUP
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Supabase environment variables are missing.");
  console.error("Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.");
  process.exit(1);
}

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Script to extract study guide content from markdown and format it for the data file
const fs = require('fs');

// Wrap the entire script in an async function to use 'await' for database calls
async function uploadStudyContent() {

  const markdown = fs.readFileSync('./content/study/cs201.md', 'utf8');

  // Parse the markdown into structured data
  const units = [];
  let currentUnit = null;
  let currentSubUnit = null;
  let currentSection = null;

  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Unit header (## Unit X)
    if (line.match(/^## Unit (\d+)/)) {
      const match = line.match(/^## Unit (\d+) — (.+)/);
      currentUnit = {
        id: parseInt(match[1]), // FIXED: Changed 'number' to 'id'
        title: match[2],
        subUnits: []
      };
      units.push(currentUnit);
      currentSubUnit = null;
    }
    
    // Sub-unit header (### X.Y)
    else if (line.match(/^### (\d+)\.(\d+)/)) {
      const match = line.match(/^### (\d+)\.(\d+) (.+)/);
      currentSubUnit = {
        sub_unit_id: `${match[1]}.${match[2]}`,
        title: match[3],
        abbreviations: null,
        intuition: null,
        code_sketch: null,
        visual_model: null, // FIXED: Changed 'visualModel' to 'visual_model'
        pitfalls: null,
        vocabulary: null,
        recap: null
      };
      currentUnit.subUnits.push(currentSubUnit);
      currentSection = null;
    }
    
    // Section headers
    else if (currentSubUnit) {
      if (line.startsWith('**Abbreviations defined.**')) {
        currentSection = 'abbreviations';
        currentSubUnit.abbreviations = line.replace('**Abbreviations defined.**', '').trim();
      }
      else if (line.startsWith('**Intuition.**')) {
        currentSection = 'intuition';
        currentSubUnit.intuition = line.replace('**Intuition.**', '').trim();
      }
      else if (line.startsWith('**Visual/mental model.**')) {
        currentSection = 'visual_model'; // FIXED: Changed 'visualModel' to 'visual_model'
        currentSubUnit.visual_model = line.replace('**Visual/mental model.**', '').trim(); // FIXED: Changed 'visualModel' to 'visual_model'
      }
      else if (line.startsWith('**Common pitfalls.**')) {
        currentSection = 'pitfalls';
        currentSubUnit.pitfalls = line.replace('**Common pitfalls.**', '').trim();
      }
      else if (line.startsWith('**Vocabulary.**')) {
        currentSection = 'vocabulary';
        currentSubUnit.vocabulary = line.replace('**Vocabulary.**', '').trim();
      }
      else if (line.startsWith('**Recap.**')) {
        currentSection = 'recap';
        currentSubUnit.recap = line.replace('**Recap.**', '').trim();
      }
      else if (line.startsWith('**Code sketch')) {
        currentSection = 'codeSketch';
        currentSubUnit.code_sketch = '';
        // Capture code block
        let j = i + 1;
        let inCodeBlock = false;
        while (j < lines.length && !lines[j].startsWith('**')) {
          if (lines[j] === '```' || lines[j].startsWith('```')) {
            if (!inCodeBlock) {
              inCodeBlock = true;
            } else {
              break;
            }
          } else if (inCodeBlock) {
            currentSubUnit.code_sketch += lines[j] + '\n';
          }
          j++;
        }
        currentSubUnit.code_sketch = currentSubUnit.code_sketch.trim();
        i = j;
      }
      // Continue existing section
      else if (currentSection && line && !line.startsWith('**') && !line.startsWith('---') && !line.startsWith('#')) {
        if (currentSection === 'abbreviations' && currentSubUnit.abbreviations) {
          currentSubUnit.abbreviations += ' ' + line.trim();
        } else if (currentSection === 'intuition' && currentSubUnit.intuition) {
          currentSubUnit.intuition += ' ' + line.trim();
        } else if (currentSection === 'visual_model' && currentSubUnit.visual_model) { // FIXED: Changed 'visualModel' to 'visual_model'
          currentSubUnit.visual_model += ' ' + line.trim(); // FIXED: Changed 'visualModel' to 'visual_model'
        } else if (currentSection === 'pitfalls' && currentSubUnit.pitfalls) {
          currentSubUnit.pitfalls += ' ' + line.trim();
        } else if (currentSection === 'vocabulary' && currentSubUnit.vocabulary) {
          currentSubUnit.vocabulary += ' ' + line.trim();
        } else if (currentSection === 'recap' && currentSubUnit.recap) {
          currentSubUnit.recap += ' ' + line.trim();
        }
      }
    }
  }

  // ----------------------------------------------------------------------
  // 2. SUPABASE INSERTION LOGIC (Moved inside async function)
  // ----------------------------------------------------------------------

  const allSubunitInserts = [];
    
  // 1. Insert Units first
  const unitData = units.map(u => ({ id: u.id, title: u.title }));
  
  console.log(`Inserting ${unitData.length} course units...`);
  const { error: unitsError } = await supabase.from('units').upsert(unitData, { onConflict: 'id' });

  if (unitsError) {
      console.error('❌ Error inserting units:', unitsError);
      return;
  }
  console.log('✅ Units inserted successfully.');


  // 2. Prepare and Insert Subunits
  units.forEach(unit => {
      unit.subUnits.forEach(subUnit => {
          const { subUnits, ...subunitFields } = subUnit;
          
          allSubunitInserts.push({
              ...subunitFields,
              unit_id: unit.id,
              // Set null for empty fields
              abbreviations: subunitFields.abbreviations || null,
              intuition: subunitFields.intuition || null,
              code_sketch: subunitFields.code_sketch || null,
              visual_model: subunitFields.visual_model || null,
              pitfalls: subunitFields.pitfalls || null,
              vocabulary: subunitFields.vocabulary || null,
              recap: subunitFields.recap || null,
          });
      });
  });

  console.log(`\nInserting ${allSubunitInserts.length} course subunits...`);

  // Insert all subunits in a single batch
  const { error: subunitsError } = await supabase.from('subunits').insert(allSubunitInserts);

  if (subunitsError) {
      console.error('❌ Error inserting subunits:', subunitsError);
      console.log('\nTip: If re-running, consider clearing the `subunits` table first.');
  } else {
      console.log('✅ Subunits inserted successfully.');
  }
}

// ----------------------------------------------------------------------
// 3. FUNCTION CALL (ADDED)
// ----------------------------------------------------------------------
uploadStudyContent();