/**
 * MDX templates for course content generation
 */

import { CourseSchema, Unit, Subunit } from '@/types/course';
import { ResearchNote, Bibliography } from '@/types/research';
import { countWords } from '@/server/utils/text';

/**
 * Generate MDX frontmatter
 */
export function generateFrontmatter(
  courseSchema: CourseSchema,
  unit: Unit,
  subunit: Subunit,
  wordCount: number
): string {
  const estimatedRead = Math.round(wordCount / 180); // 180 words per minute
  
  // Determine difficulty based on Bloom levels
  const bloomLevels = subunit.bloom;
  let difficulty = 'core';
  if (bloomLevels.includes('remember') || bloomLevels.includes('understand')) {
    difficulty = 'intro';
  } else if (bloomLevels.includes('evaluate') || bloomLevels.includes('create')) {
    difficulty = 'advanced';
  }

  return `---
course: "${courseSchema.courseId}"
unit: "${unit.unitTitle}"
subunit: "${subunit.subunitTitle}"
estimated_read: "${estimatedRead} min"
difficulty: "${difficulty}"
bloom: [${bloomLevels.map(b => `"${b}"`).join(', ')}]
tags: [${subunit.tags.map(t => `"${t}"`).join(', ')}]
version: ${courseSchema.version}
notation: [${courseSchema.notation.map(n => `"${n}"`).join(', ')}]
---`;
}

/**
 * Generate references section
 */
export function generateReferences(bibliography: Bibliography): string {
  if (bibliography.length === 0) {
    return '## References\n\n*No references available.*';
  }

  let markdown = '## References\n\n';

  bibliography.forEach((ref, index) => {
    const num = index + 1;
    const publisher = ref.publisher || 'Web';
    const date = ref.date ? ` (${new Date(ref.date).getFullYear()})` : '';
    
    markdown += `${num}. ${ref.title}${date} — ${publisher} — [${ref.url}](${ref.url})\n`;
  });

  return markdown;
}

/**
 * Validate section structure
 */
export function validateSectionOrder(mdx: string): { valid: boolean; missing: string[] } {
  const requiredSections = [
    '## Overview',
    '## Core Concepts',
    '## Worked Example',
    '## Visuals',
    '## Applications & Pitfalls',
    '## Checkpoint',
    '## References'
  ];

  const missing: string[] = [];

  for (const section of requiredSections) {
    if (!mdx.includes(section)) {
      missing.push(section);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Extract citations from markdown text
 */
export function extractCitations(text: string): number[] {
  const citations: number[] = [];
  const pattern = /\[(\d+)\]/g;
  const matches = text.matchAll(pattern);

  for (const match of matches) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num)) {
      citations.push(num);
    }
  }

  return [...new Set(citations)].sort((a, b) => a - b);
}

/**
 * Validate citations match references
 */
export function validateCitations(mdx: string, bibliographyLength: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const citations = extractCitations(mdx);

  if (citations.length < 2) {
    errors.push('Less than 2 citations found in content');
  }

  // Check if citations are sequential
  for (let i = 0; i < citations.length - 1; i++) {
    if (citations[i + 1] !== citations[i] + 1 && citations[i + 1] !== citations[i]) {
      // Allow same citation repeated, but otherwise should be sequential
      if (!citations.includes(citations[i] + 1) && citations[i + 1] > citations[i] + 1) {
        errors.push(`Citations not sequential: [${citations[i]}] followed by [${citations[i + 1]}]`);
      }
    }
  }

  // Check if any citation exceeds bibliography length
  const maxCitation = Math.max(...citations, 0);
  if (maxCitation > bibliographyLength) {
    errors.push(`Citation [${maxCitation}] exceeds bibliography length (${bibliographyLength})`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * System prompt for MDX writer
 */
export const WRITER_SYSTEM_PROMPT = `You are a university textbook author for STEM. Produce original, rigorous MDX pages.
Use the provided skeleton ONLY for scope and ordering; do not summarize uploads.
Use the provided research notes to justify all factual statements. Append [n] citations at sentence ends.
Academic tone, 700–900 words. Sections in this exact order: Overview; Core Concepts; Worked Example; Visuals; Applications & Pitfalls; Checkpoint; References.
Math in LaTeX with SI units; vectors bold. Include one unit/limit check in the example.
If sources disagree, state the prevailing view and a brief caveat.
No first/second person. No filler. No meta commentary.`;

/**
 * Researcher system prompt
 */
export const RESEARCHER_SYSTEM_PROMPT = `Find reputable sources for the subunit topic. Prefer .edu/.gov/OER/society and textbooks.
Extract verifiable claims, equations (LaTeX), and 1–3 example outlines.
Triangulate: include a claim only if at least two sources support it or one canonical textbook supports it.
Rank sources by domain authority and clarity; provide a quality score 0..1.
Return normalized ResearchNotes and a deduplicated bibliography.`;

