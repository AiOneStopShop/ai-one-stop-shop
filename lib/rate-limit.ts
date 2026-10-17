import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-memory fallback for development  
class InMemoryRatelimit {
  private hits: Map<string, number[]> = new Map();
  private maxRequests: number;
  private window: number;

  constructor(limit: number, window: number) {
    this.maxRequests = limit;
    this.window = window;
  }

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number; pending: Promise<unknown> }> {
    const now = Date.now();
    const windowStart = now - this.window;
    const reset = now + this.window;
    
    // Get existing hits for this identifier
    const existing = this.hits.get(identifier) || [];
    const recentHits = existing.filter(time => time > windowStart);
    
    if (recentHits.length >= this.maxRequests) {
      this.hits.set(identifier, recentHits);
      return { 
        success: false, 
        limit: this.maxRequests,
        remaining: 0,
        reset,
        pending: Promise.resolve()
      };
    }
    
    recentHits.push(now);
    this.hits.set(identifier, recentHits);
    
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - recentHits.length,
      reset,
      pending: Promise.resolve()
    };
  }
}

// Initialize rate limiters
function createRateLimiter(requests: number, windowMinutes: number) {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (upstashUrl && upstashToken) {
    // Use Upstash Redis for production
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, `${windowMinutes} m`),
      analytics: true,
    });
  } else {
    // Fail closed in production
    if (isProduction) {
      console.error(
        '❌ PRODUCTION ERROR: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production. ' +
        'Rate limiting is unavailable.'
      );
      // Return a limiter that always fails in production
      return {
        limit: async () => ({
          success: false,
          limit: 0,
          remaining: 0,
          reset: Date.now(),
          pending: Promise.resolve(),
        }),
      };
    }
    
    // Fallback to in-memory for development only
    console.warn(
      '⚠️  Development: Using in-memory rate limiting (not suitable for production)'
    );
    
    const windowMs = windowMinutes * 60 * 1000;
    
    return new InMemoryRatelimit(requests, windowMs);
  }
}

export const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Cheap per-instance burst guard used only when Upstash is unset.
export const apiMemoryBurst = new InMemoryRatelimit(40, 10_000);

// Export rate limiters for different endpoints
export const submitToolRateLimit = createRateLimiter(5, 15); // 5 requests per 15 minutes
export const sponsorRequestRateLimit = createRateLimiter(5, 15); // 5 requests per 15 minutes
export const sponsorIntakeRateLimit = createRateLimiter(5, 60); // 5 requests per hour
export const placementTrackRateLimit = createRateLimiter(30, 1); // 30 requests per minute
export const affiliateRedirectRateLimit = createRateLimiter(30, 1); // 30 requests per minute
export const apiRateLimit = createRateLimiter(100, 1); // 100 requests per minute for API

// Redis client and dedupe helper for click/impression tracking
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = upstashUrl && upstashToken
  ? new Redis({ url: upstashUrl, token: upstashToken })
  : null;

// In-memory fallback for dedupe (development only)
const memoryDedupe = new Map<string, number>();

/**
 * Deduplicate events using Redis SET NX EX or in-memory Map.
 * Returns true if this is the first occurrence, false if it's a duplicate.
 */
export async function dedupe(key: string, ttlSeconds: number): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  
  if (redis) {
    const result = await redis.set(key, '1', { nx: true, ex: ttlSeconds });
    return result === 'OK';
  }
  
  if (isProduction) {
    // Fail closed in production without Redis
    throw new Error('Deduplication unavailable: Upstash Redis not configured');
  }
  
  // Development fallback
  const now = Date.now();
  const expiry = memoryDedupe.get(key);
  
  if (expiry && now < expiry) {
    return false; // Duplicate
  }
  
  memoryDedupe.set(key, now + ttlSeconds * 1000);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of Array.from(memoryDedupe.entries())) {
      if (now >= v) {
        memoryDedupe.delete(k);
      }
    }
  }
  
  return true; // First occurrence
}
