import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { placementTrackRateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/client-ip';
import { createHash } from 'crypto';

// In-memory deduplication for impressions and clicks (per IP hash + placement + day)
const eventCache = new Map<string, number>();
const EVENT_DEDUPE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_HASH_SECRET || 'default-secret')).digest('hex');
}

function cleanupEventCache() {
  const now = Date.now();
  for (const [key, timestamp] of Array.from(eventCache.entries())) {
    if (now - timestamp > EVENT_DEDUPE_WINDOW) {
      eventCache.delete(key);
    }
  }
}

/**
 * Lightweight impression tracking endpoint.
 * Called when a sponsored placement is rendered.
 * No cookies, no IP storage, just aggregate counts.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placementId, eventType = 'impression' } = body;

    if (!placementId || typeof placementId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid placement ID' },
        { status: 400 }
      );
    }

    if (eventType !== 'impression' && eventType !== 'click') {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Rate limit check (30 requests per minute per IP)
    const ip = getClientIP(request);
    const { success } = await placementTrackRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Filter basic bot patterns by User-Agent
    const userAgent = request.headers.get('user-agent') || '';
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /curl/i,
      /wget/i,
      /headless/i,
    ];

    if (botPatterns.some((pattern) => pattern.test(userAgent))) {
      // Don't track bots, but return success to avoid errors
      return NextResponse.json({ tracked: false });
    }

    // Deduplicate events per IP hash + placement + day
    const ipHash = hashIP(ip);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dedupeKey = `${ipHash}:${placementId}:${eventType}:${today}`;
    const lastSeen = eventCache.get(dedupeKey);
    const now = Date.now();

    if (lastSeen && now - lastSeen < EVENT_DEDUPE_WINDOW) {
      // Already counted today
      return NextResponse.json({ tracked: false, reason: 'deduplicated' });
    }

    eventCache.set(dedupeKey, now);
    
    // Clean up old entries periodically (1% chance per request)
    if (Math.random() < 0.01) {
      cleanupEventCache();
    }

    // Verify placement is live before counting
    const supabase = getServiceSupabase();
    const { data: placement } = await supabase
      .from('public_live_placements')
      .select('id')
      .eq('id', placementId)
      .single();

    if (!placement) {
      return NextResponse.json({ tracked: false, reason: 'inactive' });
    }

    // Increment count
    await supabase.rpc('increment_placement_event', {
      p_placement_id: placementId,
      p_event_type: eventType,
    });

    return NextResponse.json({ tracked: true });
  } catch (err) {
    console.error('Placement tracking error:', err);
    // Don't fail loudly - tracking is best-effort
    return NextResponse.json({ tracked: false }, { status: 200 });
  }
}
