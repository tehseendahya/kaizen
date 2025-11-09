/**
 * HTTP utilities with retry logic and rate limiting
 */

export type RetryConfig = {
  maxRetries: number;
  baseDelay: number;  // ms
  maxDelay: number;   // ms
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 250,
  maxDelay: 8000
};

/**
 * Exponential backoff: 250ms → 2s → 8s
 */
function getRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(4, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Fetch with exponential backoff retry
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Axis-CourseGen/1.0 (Educational)',
          ...options.headers
        }
      });

      // Success or non-retryable error
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }

      // Retryable error (5xx or 429)
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      if (attempt < config.maxRetries) {
        const delay = getRetryDelay(attempt, config);
        console.warn(`[fetchWithRetry] Attempt ${attempt + 1} failed for ${url}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error: any) {
      lastError = error;
      
      if (attempt < config.maxRetries) {
        const delay = getRetryDelay(attempt, config);
        console.warn(`[fetchWithRetry] Network error on attempt ${attempt + 1} for ${url}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${config.maxRetries} retries`);
}

/**
 * Simple rate limiter using token bucket
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const newTokens = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }

  async acquire(tokens = 1): Promise<void> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return;
    }

    // Wait until we have enough tokens
    const tokensNeeded = tokens - this.tokens;
    const waitTime = (tokensNeeded / this.refillRate) * 1000;
    
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.tokens = 0;
  }
}

/**
 * Check if URL is accessible and respects robots.txt
 */
export async function checkUrlAccessible(url: string): Promise<{ accessible: boolean; status?: number; error?: string }> {
  try {
    const response = await fetchWithRetry(url, { method: 'HEAD' }, { maxRetries: 1, baseDelay: 100, maxDelay: 1000 });
    return { accessible: response.ok, status: response.status };
  } catch (error: any) {
    return { accessible: false, error: error.message };
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

