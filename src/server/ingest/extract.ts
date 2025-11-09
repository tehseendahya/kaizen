/**
 * Skeleton extraction with heuristics
 * Extracts course structure from uploaded files
 */

import { CourseSchema, Unit, Subunit, DEFAULT_NOTATION, DEFAULT_PREFERRED_SOURCES, DEFAULT_TARGET_LENGTH_WORDS, Bloom } from '@/types/course';
import { extractLatexEquations, extractFormulaPatterns } from '@/server/utils/latex';
import { normalizeText, slugify } from '@/server/utils/text';
import { extractPDF } from './pdf';
import { extractDOCX } from './docx';

// Bloom's taxonomy verbs for learning objectives detection
const BLOOM_VERBS: Record<Bloom, string[]> = {
  remember: ['define', 'list', 'recall', 'identify', 'name', 'state', 'recognize'],
  understand: ['explain', 'describe', 'summarize', 'interpret', 'discuss', 'classify'],
  apply: ['apply', 'demonstrate', 'calculate', 'solve', 'use', 'compute', 'implement'],
  analyze: ['analyze', 'compare', 'contrast', 'examine', 'differentiate', 'investigate'],
  evaluate: ['evaluate', 'assess', 'justify', 'critique', 'judge', 'argue'],
  create: ['create', 'design', 'construct', 'develop', 'formulate', 'synthesize', 'derive']
};

/**
 * Extract text from file buffer based on MIME type
 */
export async function extractTextFromFile(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
      const result = await extractPDF(buffer);
      return result.text;
    } else if (mimeType.includes('wordprocessingml') || filename.endsWith('.docx')) {
      const result = await extractDOCX(buffer);
      return result.text;
    } else if (mimeType.startsWith('text/')) {
      return buffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error: any) {
    console.error(`[extractTextFromFile] Error extracting ${filename}:`, error);
    throw error;
  }
}

/**
 * Detect headings using heuristics
 */
function detectHeadings(text: string): Array<{ text: string; line: number; level: number }> {
  const lines = text.split('\n');
  const headings: Array<{ text: string; line: number; level: number }> = [];

  const headingPatterns = [
    /^(week|unit|topic|lecture|chapter|module|lesson)\b.*$/i,
    /^\d+\.\s+[A-Z][^.]*$/,                    // "1. Introduction to Physics"
    /^[A-Z][A-Z\s]{3,}$/,                      // ALL CAPS headings
    /^#+\s+.+$/                                // Markdown headings
  ];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check markdown headings first
    const mdMatch = trimmed.match(/^(#+)\s+(.+)$/);
    if (mdMatch) {
      headings.push({
        text: mdMatch[2].trim(),
        line: index,
        level: mdMatch[1].length
      });
      return;
    }

    // Check other patterns
    for (const pattern of headingPatterns) {
      if (pattern.test(trimmed)) {
        // Determine level based on context
        const level = trimmed.match(/^(week|unit|chapter)/i) ? 1 : 2;
        headings.push({
          text: trimmed,
          line: index,
          level
        });
        break;
      }
    }
  });

  return headings;
}

/**
 * Detect learning objectives
 */
function detectLearningObjectives(text: string): string[] {
  const lines = text.split('\n');
  const objectives: string[] = [];

  const allVerbs = Object.values(BLOOM_VERBS).flat();
  const verbPattern = new RegExp(`\\b(${allVerbs.join('|')})\\b`, 'i');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Look for bullet points or numbered lists with Bloom verbs
    if ((trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) && verbPattern.test(trimmed)) {
      const cleaned = trimmed.replace(/^[-•*\d.]\s+/, '').trim();
      if (cleaned.length > 10 && cleaned.length < 200) {
        objectives.push(cleaned);
      }
    }
  });

  return objectives;
}

/**
 * Classify Bloom level based on text
 */
function classifyBloom(text: string): Bloom[] {
  const levels: Bloom[] = [];
  const lowerText = text.toLowerCase();

  for (const [level, verbs] of Object.entries(BLOOM_VERBS)) {
    if (verbs.some(verb => lowerText.includes(verb))) {
      levels.push(level as Bloom);
    }
  }

  return levels.length > 0 ? levels : ['understand']; // default
}

/**
 * Split heading if it contains multiple concepts
 * E.g., "Gauss's law: flux & symmetry" → ["Gauss's law - flux", "Gauss's law - symmetry"]
 */
function splitHeadingIfNeeded(heading: string): string[] {
  // Check for colon with multiple concepts
  const colonMatch = heading.match(/^([^:]+):\s*(.+)$/);
  if (!colonMatch) return [heading];

  const prefix = colonMatch[1].trim();
  const suffix = colonMatch[2].trim();

  // Check if suffix contains multiple concepts (& or 'and')
  const concepts = suffix.split(/\s*(?:&|and)\s*/i);
  if (concepts.length >= 2) {
    return concepts.map(concept => `${prefix} - ${concept.trim()}`);
  }

  return [heading];
}

/**
 * Extract course skeleton from text
 */
export function extractSkeleton(
  texts: Array<{ filename: string; text: string }>,
  seedMeta: { title: string; code?: string; term?: string }
): CourseSchema {
  console.log('[extractSkeleton] Processing', texts.length, 'files');

  // Combine all texts
  const combinedText = texts.map(t => t.text).join('\n\n');

  // Extract headings
  const headings = detectHeadings(combinedText);
  console.log('[extractSkeleton] Found', headings.length, 'headings');

  // Extract learning objectives
  const objectives = detectLearningObjectives(combinedText);
  console.log('[extractSkeleton] Found', objectives.length, 'learning objectives');

  // Extract formulas
  const latexFormulas = extractLatexEquations(combinedText);
  const textFormulas = extractFormulaPatterns(combinedText);
  const allFormulas = [...new Set([...latexFormulas, ...textFormulas])];
  console.log('[extractSkeleton] Found', allFormulas.length, 'formulas');

  // Build units from headings
  const units: Unit[] = [];
  let currentUnit: Unit | null = null;
  let unitOrder = 0;

  headings.forEach((heading, index) => {
    if (heading.level === 1) {
      // New unit
      if (currentUnit) {
        units.push(currentUnit);
      }

      unitOrder++;
      currentUnit = {
        unitId: slugify(heading.text),
        unitTitle: heading.text,
        order: unitOrder,
        learningObjectives: [],
        subunits: []
      };
    } else if (heading.level === 2 && currentUnit) {
      // Subunit - check if needs splitting
      const subunitTitles = splitHeadingIfNeeded(heading.text);

      subunitTitles.forEach(title => {
        const subunit: Subunit = {
          subunitId: slugify(title),
          subunitTitle: title,
          targetLengthWords: DEFAULT_TARGET_LENGTH_WORDS,
          mustCover: [],
          formulas: [],
          examStyle: [],
          bloom: classifyBloom(title),
          tags: []
        };

        currentUnit!.subunits.push(subunit);
      });
    }
  });

  // Add last unit
  if (currentUnit) {
    units.push(currentUnit);
  }

  // If no units found from headings, create a default structure
  if (units.length === 0) {
    console.warn('[extractSkeleton] No units found, creating default structure');
    units.push({
      unitId: 'unit-1',
      unitTitle: 'Introduction',
      order: 1,
      learningObjectives: objectives.slice(0, 3),
      subunits: [
        {
          subunitId: 'overview',
          subunitTitle: 'Course Overview',
          targetLengthWords: DEFAULT_TARGET_LENGTH_WORDS,
          mustCover: [],
          formulas: [],
          examStyle: [],
          bloom: ['understand'],
          tags: []
        }
      ]
    });
  }

  // Distribute learning objectives across units
  const objectivesPerUnit = Math.ceil(objectives.length / units.length);
  units.forEach((unit, index) => {
    const start = index * objectivesPerUnit;
    const end = start + objectivesPerUnit;
    unit.learningObjectives = objectives.slice(start, end);
  });

  // Distribute formulas across subunits
  const allSubunits = units.flatMap(u => u.subunits);
  if (allSubunits.length > 0) {
    const formulasPerSubunit = Math.ceil(allFormulas.length / allSubunits.length);
    allSubunits.forEach((subunit, index) => {
      const start = index * formulasPerSubunit;
      const end = start + formulasPerSubunit;
      subunit.formulas = allFormulas.slice(start, end);
      
      // Extract mustCover from formulas and subunit title
      subunit.mustCover = [
        ...subunit.formulas.slice(0, 3), // First 3 formulas
        ...subunit.subunitTitle.split(/\s+/).filter(w => w.length > 4).slice(0, 3) // Key words from title
      ];
    });
  }

  const courseSchema: CourseSchema = {
    courseId: seedMeta.code ? slugify(seedMeta.code) : slugify(seedMeta.title),
    title: seedMeta.title,
    term: seedMeta.term,
    notation: DEFAULT_NOTATION,
    preferredSources: DEFAULT_PREFERRED_SOURCES,
    prohibitedTopics: [],
    outline: units,
    createdAt: new Date().toISOString(),
    version: 1
  };

  console.log('[extractSkeleton] Generated schema:', {
    courseId: courseSchema.courseId,
    units: units.length,
    subunits: allSubunits.length,
    formulas: allFormulas.length
  });

  return courseSchema;
}

