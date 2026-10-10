import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-memory fallback for development
class InMemoryRatelimit {
  private hits: Map<string, number[]> = new Map();
  private limit: number;
  private window: number;

  constructor(limit: number, window: number) {
    this.limit = limit;
    this.window = window;
  }

  async limit(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now();
    const windowStart = now - this.window;
    
    // Get existing hits for this identifier
    const existing = this.hits.get(identifier) || [];
    const recentHits = existing.filter(time => time > windowStart);
    
    if (recentHits.length >= this.limit) {
      this.hits.set(identifier, recentHits);
      return { success: false, remaining: 0 };
    }
    
    recentHits.push(now);
    this.hits.set(identifier, recentHits);
    
    return {
      success: true,
      remaining: this.limit - recentHits.length
    };
  }
}

// Initialize rate limiters
function createRateLimiter(requests: number, window: string) {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    // Use Upstash Redis for production
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
    });
  } else {
    // Fallback to in-memory (dev only)
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️  PRODUCTION WARNING: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN not set. ' +
        'Using in-memory rate limiting which will NOT work correctly across multiple instances. ' +
        'Set Upstash environment variables for proper distributed rate limiting.'
      );
    }
    
    const windowMs = window.includes('m') 
      ? parseInt(window) * 60 * 1000 
      : parseInt(window) * 1000;
    
    return new InMemoryRatelimit(requests, windowMs);
  }
}

// Export rate limiters for different endpoints
export const submitToolRateLimit = createRateLimiter(5, '15 m'); // 5 requests per 15 minutes
export const affiliateRedirectRateLimit = createRateLimiter(30, '1 m'); // 30 requests per minute
export const apiRateLimit = createRateLimiter(100, '1 m'); // 100 requests per minute for API
