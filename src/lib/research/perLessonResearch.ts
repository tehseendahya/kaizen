/**
 * Per-lesson research - performs deep research for each individual lesson
 */

import {
  generateResearchContext,
  formatResearchForPrompt,
  type ResearchContext,
  type SimpleSearchResult
} from './simpleResearch';
import type { SkeletonLesson } from './skeletonExtraction';

export type LessonResearch = {
  lessonId: string;
  lessonTitle: string;
  sources: SimpleSearchResult[];
  researchContext: string;
  keywords: string[];
};

/**
 * Perform research for a single lesson with multiple queries for depth
 */
export async function researchLesson(
  lesson: SkeletonLesson,
  courseTitle: string,
  maxSources: number = 7
): Promise<LessonResearch> {
  console.log(`[researchLesson] Deep research: ${lesson.lessonTitle}`);

  // Build multiple research queries for comprehensive coverage
  const queries = [
    `${lesson.lessonTitle} comprehensive guide`,
    `${lesson.lessonTitle} university lecture notes`,
    `${lesson.lessonTitle} textbook explanation`,
    `${lesson.lessonTitle} worked examples`,
    `${lesson.lessonTitle} tutorial`
  ];

  // Add keyword-specific queries
  lesson.keywords.slice(0, 2).forEach(keyword => {
    queries.push(`${lesson.lessonTitle} ${keyword}`);
  });

  try {
    // Perform multiple searches and combine results
    const allSources: any[] = [];
    
    for (const query of queries.slice(0, 4)) {  // Run 4 queries per lesson
      const context = await generateResearchContext(query);
      allSources.push(...context.sources);
      
      // Stop if we have enough quality sources
      if (allSources.length >= maxSources * 2) break;
    }

    // Deduplicate and prioritize .edu/.gov
    const seen = new Set<string>();
    const unique = allSources.filter(s => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });

    // Sort by domain quality
    const sorted = unique.sort((a, b) => {
      const aScore = (a.domain.includes('.edu') || a.domain.includes('.gov')) ? 1 : 0;
      const bScore = (b.domain.includes('.edu') || b.domain.includes('.gov')) ? 1 : 0;
      return bScore - aScore;
    });

    // Limit to maxSources
    const limitedSources = sorted.slice(0, maxSources);

    // Format for AI prompt
    const researchContext = formatResearchForPrompt({
      sources: limitedSources,
      summary: '',
      keywords: lesson.keywords
    });

    console.log(`  ✓ Found ${limitedSources.length} sources for "${lesson.lessonTitle}" (${limitedSources.filter(s => s.domain.includes('.edu') || s.domain.includes('.gov')).length} academic)`);

    return {
      lessonId: lesson.lessonId,
      lessonTitle: lesson.lessonTitle,
      sources: limitedSources,
      researchContext,
      keywords: lesson.keywords
    };
  } catch (error: any) {
    console.error(`  ✗ Research failed for "${lesson.lessonTitle}":`, error.message);
    
    // Return empty research on failure
    return {
      lessonId: lesson.lessonId,
      lessonTitle: lesson.lessonTitle,
      sources: [],
      researchContext: '',
      keywords: lesson.keywords
    };
  }
}

/**
 * Research all lessons in parallel (with concurrency limit)
 */
export async function researchAllLessons(
  lessons: SkeletonLesson[],
  courseTitle: string,
  options: {
    maxSources?: number;
    concurrency?: number;
  } = {}
): Promise<LessonResearch[]> {
  const { maxSources = 5, concurrency = 3 } = options;

  console.log(`\n[researchAllLessons] Starting research for ${lessons.length} lessons`);
  console.log(`  Concurrency: ${concurrency}, Max sources per lesson: ${maxSources}`);

  const results: LessonResearch[] = [];
  const queue = [...lessons];

  // Process lessons with concurrency limit
  async function processOne() {
    while (queue.length > 0) {
      const lesson = queue.shift();
      if (!lesson) break;

      const research = await researchLesson(lesson, courseTitle, maxSources);
      results.push(research);
    }
  }

  // Run concurrent workers
  const workers = Array(concurrency).fill(null).map(() => processOne());
  await Promise.all(workers);

  const totalSources = results.reduce((sum, r) => sum + r.sources.length, 0);
  console.log(`\n[researchAllLessons] Complete! Total sources: ${totalSources}`);

  return results;
}

/**
 * Build research summary for logging/UI
 */
export function summarizeResearch(research: LessonResearch[]): {
  totalLessons: number;
  totalSources: number;
  lessonsWithSources: number;
  lessonsWithoutSources: number;
  topDomains: Array<{ domain: string; count: number }>;
} {
  const totalSources = research.reduce((sum, r) => sum + r.sources.length, 0);
  const lessonsWithSources = research.filter(r => r.sources.length > 0).length;

  // Count domains
  const domainCounts = new Map<string, number>();
  research.forEach(r => {
    r.sources.forEach(s => {
      domainCounts.set(s.domain, (domainCounts.get(s.domain) || 0) + 1);
    });
  });

  const topDomains = Array.from(domainCounts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalLessons: research.length,
    totalSources,
    lessonsWithSources,
    lessonsWithoutSources: research.length - lessonsWithSources,
    topDomains
  };
}

