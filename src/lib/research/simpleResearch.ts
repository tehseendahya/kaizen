/**
 * Simplified research integration for existing AI generation
 * Enhances GPT-5 generation with web research context
 */

import { fetchWithRetry } from '@/server/utils/http';

export type SimpleSearchResult = {
  url: string;
  title: string;
  snippet: string;
  domain: string;
};

export type ResearchContext = {
  sources: SimpleSearchResult[];
  summary: string;
  keywords: string[];
};

/**
 * Quick search using DuckDuckGo (no API key required)
 */
async function searchDuckDuckGo(query: string, maxResults = 5): Promise<SimpleSearchResult[]> {
  try {
    // Use DuckDuckGo instant answer API (free, no key needed)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&t=axis`;
    
    const response = await fetchWithRetry(url, {}, { maxRetries: 2, baseDelay: 500, maxDelay: 2000 });
    const data = await response.json();

    const results: SimpleSearchResult[] = [];

    // Extract from RelatedTopics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, maxResults)) {
        if (topic.FirstURL && topic.Text) {
          const domain = new URL(topic.FirstURL).hostname;
          results.push({
            url: topic.FirstURL,
            title: topic.Text.split(' - ')[0] || topic.Text,
            snippet: topic.Text,
            domain
          });
        }
      }
    }

    return results;
  } catch (error: any) {
    console.error('[searchDuckDuckGo] Error:', error.message);
    return [];
  }
}

/**
 * Search using Tavily if API key is available (better quality)
 */
async function searchTavily(query: string, maxResults = 5): Promise<SimpleSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        max_results: maxResults,
        include_domains: ['edu', 'gov', 'org'],
      })
    });

    if (!response.ok) {
      console.error('[searchTavily] API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return (data.results || []).map((r: any) => {
      const domain = new URL(r.url).hostname;
      return {
        url: r.url,
        title: r.title || '',
        snippet: r.content || '',
        domain
      };
    });
  } catch (error: any) {
    console.error('[searchTavily] Error:', error.message);
    return [];
  }
}

/**
 * Perform smart search with fallback
 */
async function smartSearch(query: string): Promise<SimpleSearchResult[]> {
  // Try Tavily first (if available)
  let results = await searchTavily(query);
  
  // Fallback to DuckDuckGo
  if (results.length === 0) {
    results = await searchDuckDuckGo(query);
  }

  return results;
}

/**
 * Extract key concepts from course materials text
 */
function extractKeywords(text: string, limit = 10): string[] {
  // Simple keyword extraction: find capitalized phrases and technical terms
  const words = text.split(/\s+/);
  const keywords = new Set<string>();

  // Multi-word capitalized phrases
  for (let i = 0; i < words.length - 1; i++) {
    const word = words[i].replace(/[^\w\s]/g, '');
    if (word.length > 3 && /^[A-Z]/.test(word)) {
      keywords.add(word);
      
      // Check for 2-word phrases
      const nextWord = words[i + 1].replace(/[^\w\s]/g, '');
      if (/^[A-Z]/.test(nextWord)) {
        keywords.add(`${word} ${nextWord}`);
      }
    }
  }

  // Technical terms (contains numbers, Greek letters, or special chars)
  const technicalPattern = /\w*[0-9αβγδεθλμπσφψω∇∂∫∑∏]\w*/gi;
  const technicalMatches = text.match(technicalPattern);
  if (technicalMatches) {
    technicalMatches.forEach(term => {
      if (term.length > 2) keywords.add(term);
    });
  }

  return Array.from(keywords).slice(0, limit);
}

/**
 * Generate research context for a topic
 */
export async function generateResearchContext(
  topic: string,
  materialsText?: string
): Promise<ResearchContext> {
  console.log('[generateResearchContext] Researching:', topic);

  // Extract keywords from materials if provided
  const keywords = materialsText ? extractKeywords(materialsText) : [];

  // Generate search queries
  const queries = [
    `${topic} university lecture notes`,
    `${topic} textbook`,
    `${topic} explained`,
  ];

  // If we have keywords, add specific queries
  if (keywords.length > 0) {
    queries.push(`${topic} ${keywords[0]}`);
  }

  // Perform searches
  const allResults: SimpleSearchResult[] = [];
  
  for (const query of queries.slice(0, 3)) { // Limit to 3 queries to stay fast
    const results = await smartSearch(query);
    allResults.push(...results);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const uniqueResults = allResults.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Prioritize .edu and .gov domains
  const prioritized = uniqueResults.sort((a, b) => {
    const aScore = (a.domain.includes('.edu') || a.domain.includes('.gov')) ? 1 : 0;
    const bScore = (b.domain.includes('.edu') || b.domain.includes('.gov')) ? 1 : 0;
    return bScore - aScore;
  });

  // Create summary from top results
  const topResults = prioritized.slice(0, 5);
  const summary = topResults
    .map(r => `${r.title}: ${r.snippet}`)
    .join('\n\n');

  console.log('[generateResearchContext] Found', topResults.length, 'sources');

  return {
    sources: topResults,
    summary,
    keywords: keywords.slice(0, 5)
  };
}

/**
 * Format research context for AI prompt
 */
export function formatResearchForPrompt(context: ResearchContext): string {
  if (context.sources.length === 0) {
    return '';
  }

  let prompt = '\n\n## RESEARCH CONTEXT (Use these sources for factual grounding):\n\n';

  context.sources.forEach((source, index) => {
    prompt += `[${index + 1}] ${source.title}\n`;
    prompt += `    Source: ${source.domain}\n`;
    prompt += `    Summary: ${source.snippet}\n`;
    prompt += `    URL: ${source.url}\n\n`;
  });

  if (context.keywords.length > 0) {
    prompt += `Key concepts to cover: ${context.keywords.join(', ')}\n`;
  }

  prompt += '\nWhen using information from these sources, cite them using [n] at the end of relevant sentences.\n';

  return prompt;
}

/**
 * Extract citations from generated content
 */
export function extractCitations(content: string): number[] {
  const citations = new Set<number>();
  const pattern = /\[(\d+)\]/g;
  const matches = content.matchAll(pattern);

  for (const match of matches) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num)) {
      citations.add(num);
    }
  }

  return Array.from(citations).sort((a, b) => a - b);
}

/**
 * Generate bibliography from sources and citations
 */
export function generateBibliography(
  sources: SimpleSearchResult[],
  citations: number[]
): string {
  if (sources.length === 0 || citations.length === 0) {
    return '';
  }

  let bibliography = '\n\n## References\n\n';

  citations.forEach(citNum => {
    const source = sources[citNum - 1]; // Citations are 1-indexed
    if (source) {
      bibliography += `${citNum}. ${source.title} — ${source.domain} — ${source.url}\n`;
    }
  });

  return bibliography;
}

