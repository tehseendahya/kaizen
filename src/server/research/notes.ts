/**
 * Extract research notes from fetched content with ranking
 */

import { ResearchNote } from '@/types/research';
import { FetchedContent } from './fetch';
import { extractLatexEquations, extractFormulaPatterns } from '@/server/utils/latex';
import { extractSentences, computeHash } from '@/server/utils/text';
import { extractDomain } from '@/server/utils/http';

/**
 * Domain authority weights
 */
const DOMAIN_WEIGHTS: Record<string, number> = {
  // Educational institutions
  '.edu': 0.4,
  'openstax.org': 0.5,
  'mit.edu': 0.5,
  'stanford.edu': 0.5,
  'berkeley.edu': 0.5,
  
  // Government
  '.gov': 0.4,
  'nasa.gov': 0.5,
  'nist.gov': 0.5,
  
  // Academic societies
  'aps.org': 0.3,
  'ieee.org': 0.3,
  'aapt.org': 0.3,
  
  // Open educational resources
  'khanacademy.org': 0.3,
  'coursera.org': 0.2,
  'edx.org': 0.2,
};

/**
 * Compute quality score for content
 */
export function computeQualityScore(content: FetchedContent): number {
  let score = 0.0;

  const domain = extractDomain(content.url);

  // Domain authority
  for (const [key, weight] of Object.entries(DOMAIN_WEIGHTS)) {
    if (domain.includes(key)) {
      score += weight;
      break;
    }
  }

  // Default weight for university notes (if .edu but not in special list)
  if (domain.endsWith('.edu') && score === 0) {
    score += 0.2;
  }

  // Freshness (based on published time if available)
  if (content.publishedTime) {
    const publishedDate = new Date(content.publishedTime);
    const now = new Date();
    const ageYears = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (ageYears <= 3) {
      score += 0.1;
    } else if (ageYears <= 10) {
      score += 0.05;
    }
  }

  // Content density (equations, figures, headings)
  const text = content.textContent;
  const hasEquations = /\$[^$]+\$/.test(text) || /\\(?:frac|int|sum)/.test(text);
  const hasFigures = /Figure \d+|Fig\. \d+/.test(text);
  const hasHeadings = /<h[1-6]/.test(content.content);

  if (hasEquations) score += 0.05;
  if (hasFigures) score += 0.025;
  if (hasHeadings) score += 0.025;

  // Penalize SEO spam indicators
  const spamIndicators = [
    'best', 'top 10', 'you need to know', 'ultimate guide',
    'click here', 'buy now', 'sponsored'
  ];

  const lowerText = text.toLowerCase();
  const spamCount = spamIndicators.filter(phrase => lowerText.includes(phrase)).length;
  if (spamCount > 0) {
    score -= 0.3 * Math.min(spamCount, 3);
  }

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, score));
}

/**
 * Extract declarative claims from text
 */
function extractClaims(text: string): string[] {
  const sentences = extractSentences(text);
  const claims: string[] = [];

  for (const sentence of sentences) {
    // Filter for declarative statements (not questions, not commands)
    if (sentence.endsWith('?') || sentence.endsWith('!')) continue;
    if (sentence.match(/^(How|Why|What|When|Where|Consider|Try|Let)/)) continue;

    // Should be substantive (20-200 chars)
    if (sentence.length < 20 || sentence.length > 200) continue;

    // Should contain verbs indicating facts
    const factVerbs = ['is', 'are', 'was', 'were', 'equals', 'represents', 'describes', 'states'];
    if (factVerbs.some(verb => sentence.toLowerCase().includes(verb))) {
      claims.push(sentence);
    }
  }

  // Limit to top 10 claims
  return claims.slice(0, 10);
}

/**
 * Extract example outlines from text
 */
function extractExamples(text: string): string[] {
  const examples: string[] = [];

  // Look for "Example:", "Problem:", "Exercise:" sections
  const examplePattern = /(Example|Problem|Exercise|Question|Solution):\s*([^\n]{50,300})/gi;
  const matches = text.matchAll(examplePattern);

  for (const match of matches) {
    if (match[2]) {
      examples.push(match[2].trim());
    }
  }

  // Limit to 3 examples
  return examples.slice(0, 3);
}

/**
 * Extract research note from fetched content
 */
export function extractResearchNote(content: FetchedContent): ResearchNote {
  const qualityScore = computeQualityScore(content);

  // Extract claims
  const claims = extractClaims(content.textContent);

  // Extract equations
  const latexEquations = extractLatexEquations(content.textContent);
  const textFormulas = extractFormulaPatterns(content.textContent);
  const equations = [...new Set([...latexEquations, ...textFormulas])].slice(0, 5);

  // Extract examples
  const examples = extractExamples(content.textContent);

  const note: ResearchNote = {
    url: content.url,
    title: content.title,
    publisher: content.siteName,
    date: content.publishedTime,
    quality: qualityScore,
    claims,
    equations,
    examples,
    hash: content.hash
  };

  return note;
}

/**
 * Rank and filter research notes
 * Keep top K based on quality, deduplicating by hash
 */
export function rankAndFilter(notes: ResearchNote[], k: number): ResearchNote[] {
  // Deduplicate by hash
  const seen = new Set<string>();
  const unique = notes.filter(note => {
    if (seen.has(note.hash)) return false;
    seen.add(note.hash);
    return true;
  });

  // Sort by quality score (descending)
  const sorted = unique.sort((a, b) => b.quality - a.quality);

  // Keep top K
  return sorted.slice(0, k);
}

/**
 * Check if claim is supported by multiple notes (triangulation)
 */
export function isTriangulated(claim: string, notes: ResearchNote[]): boolean {
  const normalizedClaim = claim.toLowerCase();
  let supportCount = 0;
  let hasCanonicalSource = false;

  for (const note of notes) {
    // Check if any claim in this note is similar
    const hasSimilarClaim = note.claims.some(c => {
      const normalizedNoteClaim = c.toLowerCase();
      // Simple similarity: shared significant words
      const words1 = normalizedClaim.split(/\s+/).filter(w => w.length > 4);
      const words2 = normalizedNoteClaim.split(/\s+/).filter(w => w.length > 4);
      const shared = words1.filter(w => words2.includes(w)).length;
      return shared >= 3;
    });

    if (hasSimilarClaim) {
      supportCount++;

      // Check if this is a canonical source
      const domain = extractDomain(note.url);
      if (domain.includes('openstax') || domain.includes('mit.edu') || domain.includes('stanford.edu')) {
        hasCanonicalSource = true;
      }
    }
  }

  // Triangulated if: 2+ sources OR 1 canonical source
  return supportCount >= 2 || hasCanonicalSource;
}

/**
 * Filter claims to only include triangulated ones
 */
export function filterTriangulatedClaims(notes: ResearchNote[]): ResearchNote[] {
  return notes.map(note => ({
    ...note,
    claims: note.claims.filter(claim => isTriangulated(claim, notes))
  }));
}

