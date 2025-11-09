/**
 * Enhanced skeleton extraction - extracts STRUCTURE ONLY from uploaded files
 * Does not extract content - that will come from web research
 */

import { slugify } from '@/server/utils/text';
import { extractLatexEquations, extractFormulaPatterns } from '@/server/utils/latex';

export type SkeletonLesson = {
  lessonId: string;
  lessonTitle: string;
  keywords: string[];  // For research queries
  formulas: string[];  // For research queries
};

export type SkeletonUnit = {
  unitId: string;
  unitTitle: string;
  lessons: SkeletonLesson[];
  order: number;
};

export type CourseSkeleton = {
  courseTitle: string;
  courseCode?: string;
  courseTerm?: string;
  courseDescription?: string;
  units: SkeletonUnit[];
};

/**
 * Extract topics and structure from text (no content)
 */
export function extractCourseSkeleton(
  texts: Array<{ filename: string; text: string }>,
  seedMeta: { title: string; code?: string; term?: string; description?: string }
): CourseSkeleton {
  console.log('[extractCourseSkeleton] Extracting structure from', texts.length, 'files');

  const combinedText = texts.map(t => t.text).join('\n\n');
  const lines = combinedText.split('\n');

  // Detect headings (units and lessons)
  const headings = detectStructuralHeadings(lines);
  console.log('[extractCourseSkeleton] Found', headings.length, 'structural headings');

  // Extract formulas for research context
  const latexFormulas = extractLatexEquations(combinedText);
  const textFormulas = extractFormulaPatterns(combinedText);
  const allFormulas = [...new Set([...latexFormulas, ...textFormulas])];

  // Build skeleton
  const units: SkeletonUnit[] = [];
  let currentUnit: SkeletonUnit | null = null;
  let unitOrder = 0;

  headings.forEach(heading => {
    if (heading.level === 1) {
      // New unit
      if (currentUnit) {
        units.push(currentUnit);
      }

      unitOrder++;
      currentUnit = {
        unitId: slugify(heading.text),
        unitTitle: heading.text,
        lessons: [],
        order: unitOrder
      };
    } else if (heading.level === 2 && currentUnit) {
      // New lesson
      const keywords = extractKeywords(heading.text);
      
      currentUnit.lessons.push({
        lessonId: slugify(heading.text),
        lessonTitle: heading.text,
        keywords,
        formulas: []  // Will be populated from unit-level formulas
      });
    }
  });

  // Add last unit
  if (currentUnit) {
    units.push(currentUnit);
  }

  // If no structure found or too few units, create comprehensive default
  if (units.length === 0) {
    console.warn('[extractCourseSkeleton] No clear structure found, creating comprehensive default');
    units.push(...createComprehensiveDefault(combinedText, seedMeta));
  } else if (units.length < 3) {
    console.warn('[extractCourseSkeleton] Only found', units.length, 'units, expanding to minimum 6');
    // Expand each unit into multiple units by splitting lessons
    const expandedUnits = expandUnitsToMinimum(units, 6);
    units.splice(0, units.length, ...expandedUnits);
  }

  // Distribute formulas across lessons
  distributeFormulas(units, allFormulas);

  const skeleton: CourseSkeleton = {
    courseTitle: seedMeta.title,
    courseCode: seedMeta.code,
    courseTerm: seedMeta.term,
    courseDescription: seedMeta.description || extractDescription(combinedText),
    units
  };

  console.log('[extractCourseSkeleton] Generated skeleton:', {
    units: skeleton.units.length,
    lessons: skeleton.units.reduce((sum, u) => sum + u.lessons.length, 0),
    formulas: allFormulas.length
  });

  return skeleton;
}

/**
 * Detect structural headings (units and lessons)
 */
function detectStructuralHeadings(lines: string[]): Array<{ text: string; line: number; level: number }> {
  const headings: Array<{ text: string; line: number; level: number }> = [];

  const unitPatterns = [
    /^(week|unit|chapter|module|part|section)\s+(\d+|[IVX]+)[:\s-]+(.+)$/i,
    /^(\d+)\.\s+([A-Z][^.]{10,100})$/,  // "1. Introduction to Databases"
    /^#+\s+(week|unit|chapter|module|part)\s+(\d+|[IVX]+)/i,
    /^[IVX]+\.\s+([A-Z][^.]{10,100})$/,  // "I. Introduction"
    /^(introduction|overview|fundamentals|advanced|conclusion)\s*$/i,  // Common section names
  ];

  const lessonPatterns = [
    /^(lesson|lecture|topic|lab|recitation|discussion)\s+(\d+\.?\d*)[:\s-]+(.+)$/i,
    /^\d+\.\d+\s+(.+)$/,  // 1.1 Topic
    /^#+\s+(?:lesson|lecture|topic|lab)/i,
    /^-\s+([A-Z][^.!?]{15,100})$/,  // "- Important Concept Name"
    /^•\s+([A-Z][^.!?]{15,100})$/,  // "• Important Concept Name"
  ];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 5) return;

    // Check markdown headings first
    const mdMatch = trimmed.match(/^(#+)\s+(.+)$/);
    if (mdMatch) {
      const level = mdMatch[1].length <= 2 ? 1 : 2;
      headings.push({
        text: mdMatch[2].trim(),
        line: index,
        level
      });
      return;
    }

    // Check unit patterns
    for (const pattern of unitPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const title = match[2] || match[0];
        headings.push({
          text: title.trim(),
          line: index,
          level: 1
        });
        return;
      }
    }

    // Check lesson patterns
    for (const pattern of lessonPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const title = match[1] || match[0];
        if (title.length > 10 && title.length < 100) {
          headings.push({
            text: title.trim(),
            line: index,
            level: 2
          });
          return;
        }
      }
    }
  });

  return headings;
}

/**
 * Extract keywords from heading for research queries
 */
function extractKeywords(text: string): string[] {
  // Remove common words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  return [...new Set(words)].slice(0, 5);
}

/**
 * Create comprehensive default skeleton (6-10 units) if no structure detected
 */
function createComprehensiveDefault(text: string, seedMeta: any): SkeletonUnit[] {
  const keywords = extractKeywords(text.slice(0, 5000));
  const courseTitle = seedMeta.title || 'Course';
  
  // Create 6 comprehensive units as default
  return [
    {
      unitId: 'introduction',
      unitTitle: 'Introduction and Foundations',
      order: 1,
      lessons: [
        { lessonId: 'overview', lessonTitle: 'Course Overview and Objectives', keywords: keywords.slice(0, 3), formulas: [] },
        { lessonId: 'fundamentals', lessonTitle: 'Fundamental Concepts', keywords: keywords.slice(3, 6), formulas: [] },
      ]
    },
    {
      unitId: 'core-concepts',
      unitTitle: 'Core Concepts and Principles',
      order: 2,
      lessons: [
        { lessonId: 'theory', lessonTitle: 'Theoretical Framework', keywords: keywords.slice(6, 9), formulas: [] },
        { lessonId: 'applications', lessonTitle: 'Basic Applications', keywords: keywords.slice(9, 12), formulas: [] },
      ]
    },
    {
      unitId: 'intermediate',
      unitTitle: 'Intermediate Topics',
      order: 3,
      lessons: [
        { lessonId: 'methods', lessonTitle: 'Methods and Techniques', keywords: keywords.slice(0, 3), formulas: [] },
        { lessonId: 'analysis', lessonTitle: 'Analysis and Problem Solving', keywords: keywords.slice(3, 6), formulas: [] },
      ]
    },
    {
      unitId: 'advanced',
      unitTitle: 'Advanced Topics',
      order: 4,
      lessons: [
        { lessonId: 'advanced-theory', lessonTitle: 'Advanced Theoretical Concepts', keywords: keywords.slice(6, 9), formulas: [] },
        { lessonId: 'complex-applications', lessonTitle: 'Complex Applications', keywords: keywords.slice(9, 12), formulas: [] },
      ]
    },
    {
      unitId: 'practical',
      unitTitle: 'Practical Implementation',
      order: 5,
      lessons: [
        { lessonId: 'case-studies', lessonTitle: 'Case Studies and Examples', keywords: keywords.slice(0, 3), formulas: [] },
        { lessonId: 'best-practices', lessonTitle: 'Best Practices', keywords: keywords.slice(3, 6), formulas: [] },
      ]
    },
    {
      unitId: 'synthesis',
      unitTitle: 'Synthesis and Advanced Topics',
      order: 6,
      lessons: [
        { lessonId: 'integration', lessonTitle: 'Integrating Concepts', keywords: keywords.slice(6, 9), formulas: [] },
        { lessonId: 'future', lessonTitle: 'Future Directions and Trends', keywords: keywords.slice(9, 12), formulas: [] },
      ]
    }
  ];
}

/**
 * Expand units to meet minimum count by splitting lessons
 */
function expandUnitsToMinimum(units: SkeletonUnit[], minUnits: number): SkeletonUnit[] {
  if (units.length >= minUnits) return units;

  const expanded: SkeletonUnit[] = [];

  for (const unit of units) {
    if (unit.lessons.length >= 3 && expanded.length + (units.length - expanded.length) < minUnits) {
      // Split this unit into multiple units
      const lessonsPerUnit = Math.ceil(unit.lessons.length / 2);
      
      for (let i = 0; i < unit.lessons.length; i += lessonsPerUnit) {
        const subLessons = unit.lessons.slice(i, i + lessonsPerUnit);
        const partNum = Math.floor(i / lessonsPerUnit) + 1;
        
        expanded.push({
          unitId: `${unit.unitId}-part${partNum}`,
          unitTitle: `${unit.unitTitle} - Part ${partNum}`,
          order: expanded.length + 1,
          lessons: subLessons
        });
      }
    } else {
      expanded.push({
        ...unit,
        order: expanded.length + 1
      });
    }
  }

  // If still not enough, add synthetic units
  while (expanded.length < minUnits) {
    const lastKeywords = expanded[expanded.length - 1]?.lessons[0]?.keywords || [];
    expanded.push({
      unitId: `advanced-${expanded.length + 1}`,
      unitTitle: `Advanced Topics ${expanded.length + 1}`,
      order: expanded.length + 1,
      lessons: [
        {
          lessonId: `advanced-lesson-${expanded.length + 1}`,
          lessonTitle: `Advanced Concepts ${expanded.length + 1}`,
          keywords: lastKeywords,
          formulas: []
        }
      ]
    });
  }

  return expanded;
}

/**
 * Distribute formulas across lessons for research context
 */
function distributeFormulas(units: SkeletonUnit[], formulas: string[]) {
  const allLessons = units.flatMap(u => u.lessons);
  if (allLessons.length === 0) return;

  const formulasPerLesson = Math.ceil(formulas.length / allLessons.length);

  allLessons.forEach((lesson, index) => {
    const start = index * formulasPerLesson;
    const end = start + formulasPerLesson;
    lesson.formulas = formulas.slice(start, end);
  });
}

/**
 * Extract course description from text
 */
function extractDescription(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Look for description-like content in first 20 lines
  for (const line of lines.slice(0, 20)) {
    if (line.length > 50 && line.length < 300 && !line.match(/^(week|unit|chapter|lesson)/i)) {
      return line;
    }
  }

  return 'Course content generated from uploaded materials and web research.';
}

