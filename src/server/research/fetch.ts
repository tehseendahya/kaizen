/**
 * Fetch and extract readable content from URLs
 */

import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { fetchWithRetry, extractDomain } from '@/server/utils/http';
import { normalizeText, computeHash } from '@/server/utils/text';

export type FetchedContent = {
  url: string;
  title: string;
  content: string;
  textContent: string;
  excerpt?: string;
  siteName?: string;
  publishedTime?: string;
  hash: string;
};

/**
 * Fetch and extract readable content from URL
 */
export async function fetchAndExtract(url: string): Promise<FetchedContent> {
  console.log(`[fetchAndExtract] Fetching ${url}`);

  try {
    // Fetch HTML
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Check robots meta tag
    if (html.includes('noindex') || html.includes('nofollow')) {
      throw new Error('Page has noindex/nofollow meta tag');
    }

    // Parse with Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Failed to extract article content');
    }

    // Extract metadata from DOM
    const doc = dom.window.document;
    const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || extractDomain(url);
    const publishedTime = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content');

    const textContent = normalizeText(article.textContent);
    const contentHash = computeHash(textContent);

    console.log(`[fetchAndExtract] Extracted ${textContent.length} chars from ${url}`);

    return {
      url,
      title: article.title || '',
      content: article.content || '',
      textContent,
      excerpt: article.excerpt,
      siteName,
      publishedTime,
      hash: contentHash
    };
  } catch (error: any) {
    console.error(`[fetchAndExtract] Error fetching ${url}:`, error.message);
    throw error;
  }
}

/**
 * Fetch multiple URLs in parallel (with concurrency limit)
 */
export async function fetchBatch(
  urls: string[],
  concurrency = 3
): Promise<Array<{ url: string; content?: FetchedContent; error?: string }>> {
  const results: Array<{ url: string; content?: FetchedContent; error?: string }> = [];
  const queue = [...urls];

  async function processOne() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;

      try {
        const content = await fetchAndExtract(url);
        results.push({ url, content });
      } catch (error: any) {
        results.push({ url, error: error.message });
      }
    }
  }

  // Run concurrent workers
  const workers = Array(concurrency).fill(null).map(() => processOne());
  await Promise.all(workers);

  return results;
}

/**
 * Check if content is substantial enough
 */
export function isSubstantialContent(content: FetchedContent): boolean {
  const wordCount = content.textContent.split(/\s+/).length;
  
  // At least 300 words
  if (wordCount < 300) return false;

  // Check for common spam indicators
  const spamPhrases = [
    'subscribe to our newsletter',
    'click here',
    'buy now',
    'limited time offer',
    'search results for'
  ];

  const lowerContent = content.textContent.toLowerCase();
  const spamCount = spamPhrases.filter(phrase => lowerContent.includes(phrase)).length;

  // Reject if too many spam phrases
  if (spamCount > 2) return false;

  return true;
}

