/**
 * Enhanced course draft generation with web research
 * Wraps the existing generateCourseDraft with research context
 */

import OpenAI from 'openai';
import { CourseContentV1 } from '@/lib/course-schema';
import {
  generateResearchContext,
  formatResearchForPrompt,
  extractCitations,
  generateBibliography,
  type ResearchContext,
  type SimpleSearchResult
} from '@/lib/research/simpleResearch';

// Import the existing generation function (we'll enhance it)
import { generateCourseDraft } from './generateCourseDraft';

export type ResearchEnhancedResult = {
  content: CourseContentV1;
  researchSources: SimpleSearchResult[];
  citationsUsed: number[];
};

/**
 * Generate course draft with web research enhancement
 */
export async function generateCourseDraftWithResearch(
  seedMeta: {
    title: string;
    code?: string;
    term?: string;
    description?: string;
  },
  parsed: Array<{ source: string; text: string }>,
  options: {
    enableResearch?: boolean;
    maxSources?: number;
  } = {}
): Promise<ResearchEnhancedResult> {
  const { enableResearch = true, maxSources = 5 } = options;

  console.log('\n🔬 [Research] Starting research-enhanced generation');
  console.log(`   Research enabled: ${enableResearch}`);

  let researchContext: ResearchContext | null = null;

  // Step 1: Perform web research if enabled
  if (enableResearch) {
    try {
      console.log('\n📚 [Research] Gathering external sources...');
      
      // Generate research query from course title and description
      const researchTopic = `${seedMeta.title} ${seedMeta.description || ''}`.trim();
      
      // Combine all parsed text for keyword extraction
      const combinedText = parsed.map(p => p.text).join('\n\n').slice(0, 10000);
      
      researchContext = await generateResearchContext(researchTopic, combinedText);
      
      console.log(`   ✓ Found ${researchContext.sources.length} sources`);
      console.log(`   ✓ Extracted ${researchContext.keywords.length} key concepts`);
      
      if (researchContext.sources.length > 0) {
        console.log('\n   Top sources:');
        researchContext.sources.slice(0, 3).forEach((src, i) => {
          console.log(`   ${i + 1}. ${src.title} (${src.domain})`);
        });
      }
    } catch (error: any) {
      console.warn('[Research] Research failed, continuing without:', error.message);
      researchContext = null;
    }
  }

  // Step 2: Enhance parsed materials with research context
  const enhancedParsed = [...parsed];
  
  if (researchContext && researchContext.sources.length > 0) {
    // Add research context as a synthetic "source"
    const researchPrompt = formatResearchForPrompt(researchContext);
    
    enhancedParsed.push({
      source: '__web_research__',
      text: researchPrompt
    });
    
    console.log('\n📝 [Research] Added research context to generation input');
  }

  // Step 3: Generate course content using enhanced materials
  console.log('\n🤖 [AI] Generating course content...');
  
  const content = await generateCourseDraft(seedMeta, enhancedParsed);

  // Step 4: Extract and validate citations
  let citationsUsed: number[] = [];
  const sources = researchContext?.sources || [];

  if (sources.length > 0) {
    // Extract all content text to find citations
    const allContentText = content.units
      .flatMap(unit => unit.lessons)
      .flatMap(lesson => lesson.contentBlocks)
      .map(block => block.body)
      .join('\n');

    citationsUsed = extractCitations(allContentText);
    
    console.log(`\n📖 [Research] Citations analysis:`);
    console.log(`   Total citations found: ${citationsUsed.length}`);
    console.log(`   Citation numbers: [${citationsUsed.join(', ')}]`);

    // Add bibliography to last lesson of last unit if citations exist
    if (citationsUsed.length > 0 && content.units.length > 0) {
      const lastUnit = content.units[content.units.length - 1];
      if (lastUnit.lessons.length > 0) {
        const lastLesson = lastUnit.lessons[lastUnit.lessons.length - 1];
        
        // Add bibliography as a content block
        const bibliography = generateBibliography(sources, citationsUsed);
        if (bibliography) {
          lastLesson.contentBlocks.push({
            type: 'note',
            body: bibliography
          });
          console.log(`   ✓ Added bibliography with ${citationsUsed.length} references`);
        }
      }
    }
  }

  console.log('\n✅ [Research] Generation complete\n');

  return {
    content,
    researchSources: sources,
    citationsUsed
  };
}

/**
 * Simpler API: auto-enable research by default
 */
export async function generateWithResearch(
  seedMeta: {
    title: string;
    code?: string;
    term?: string;
    description?: string;
  },
  parsed: Array<{ source: string; text: string }>
): Promise<CourseContentV1> {
  const result = await generateCourseDraftWithResearch(seedMeta, parsed, {
    enableResearch: true
  });
  
  return result.content;
}

