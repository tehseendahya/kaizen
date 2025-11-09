/**
 * Search implementation with provider support (Tavily, Bing)
 */

import { Subunit } from '@/types/course';
import { SearchDepth } from '@/types/research';
import { RateLimiter } from '@/server/utils/http';
import { computeHash } from '@/server/utils/text';

export type SearchResult = {
  url: string;
  title: string;
  snippet: string;
  score?: number;
};

export type SearchProvider = 'tavily' | 'bing';

// Rate limiters for each provider
const tavilyLimiter = new RateLimiter(10, 1); // 10 requests per second
const bingLimiter = new RateLimiter(3, 1);    // 3 requests per second

/**
 * Generate search queries for a subunit
 */
export function generateSearchQueries(subunit: Subunit, depth: SearchDepth): string[] {
  const baseQueries: string[] = [];

  // Base query from title
  baseQueries.push(subunit.subunitTitle);

  // Queries with must-cover concepts
  subunit.mustCover.slice(0, 3).forEach(concept => {
    baseQueries.push(`${subunit.subunitTitle} ${concept}`);
  });

  // Queries with formulas
  subunit.formulas.slice(0, 2).forEach(formula => {
    // Remove LaTeX commands for search
    const cleanFormula = formula.replace(/\\[a-z]+/g, '').trim();
    if (cleanFormula) {
      baseQueries.push(`${subunit.subunitTitle} ${cleanFormula}`);
    }
  });

  // Add modifiers for academic sources
  const modifiers = [
    'site:.edu pdf',
    'site:.gov',
    'OpenStax chapter',
    'lecture notes',
    'derivation',
    'worked example'
  ];

  const queries: string[] = [];

  // Standard depth: 6 queries
  // Deep depth: 10 queries
  const targetCount = depth === 'standard' ? 6 : 10;

  baseQueries.forEach(base => {
    modifiers.forEach(modifier => {
      if (queries.length < targetCount) {
        queries.push(`${base} ${modifier}`);
      }
    });
  });

  // Ensure we have at least the base queries
  while (queries.length < Math.min(targetCount, baseQueries.length + 2)) {
    queries.push(baseQueries[queries.length % baseQueries.length]);
  }

  return queries.slice(0, targetCount);
}

/**
 * Search using Tavily API
 */
async function searchTavily(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY not configured');
  }

  await tavilyLimiter.acquire();

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        max_results: 5,
        include_domains: ['edu', 'gov', 'org'],
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return (data.results || []).map((r: any) => ({
      url: r.url,
      title: r.title || '',
      snippet: r.content || '',
      score: r.score
    }));
  } catch (error: any) {
    console.error('[searchTavily] Error:', error);
    throw error;
  }
}

/**
 * Search using Bing API
 */
async function searchBing(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.BING_SEARCH_KEY;
  if (!apiKey) {
    throw new Error('BING_SEARCH_KEY not configured');
  }

  await bingLimiter.acquire();

  try {
    const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5`;
    
    const response = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Bing API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return (data.webPages?.value || []).map((r: any) => ({
      url: r.url,
      title: r.name || '',
      snippet: r.snippet || ''
    }));
  } catch (error: any) {
    console.error('[searchBing] Error:', error);
    throw error;
  }
}

/**
 * Execute search with configured provider
 */
export async function executeSearch(
  queries: string[],
  provider: SearchProvider = (process.env.RESEARCH_PROVIDER as SearchProvider) || 'tavily'
): Promise<SearchResult[]> {
  const allResults: SearchResult[] = [];

  console.log(`[executeSearch] Running ${queries.length} queries using ${provider}`);

  for (const query of queries) {
    try {
      const results = provider === 'tavily' 
        ? await searchTavily(query)
        : await searchBing(query);

      allResults.push(...results);
      console.log(`[executeSearch] Query "${query}" returned ${results.length} results`);
    } catch (error: any) {
      console.error(`[executeSearch] Failed for query "${query}":`, error.message);
      // Continue with other queries
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allResults.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  console.log(`[executeSearch] Total unique results: ${unique.length}`);
  return unique;
}

/**
 * Compute cache key for search results
 */
export function computeSearchCacheKey(subunitId: string, depth: SearchDepth, version: number): string {
  return computeHash(`${subunitId}-${depth}-${version}`);
}

