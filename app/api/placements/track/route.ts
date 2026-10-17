import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { placementTrackRateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/client-ip';

// In-memory deduplication for impressions (per IP + placement within 5 minutes)
const impressionCache = new Map<string, number>();
const IMPRESSION_DEDUPE_WINDOW = 5 * 60 * 1000; // 5 minutes

function cleanupImpressionCache() {
  const now = Date.now();
  const entries = Array.from(impressionCache.entries());
  for (const [key, timestamp] of entries) {
    if (now - timestamp > IMPRESSION_DEDUPE_WINDOW) {
      impressionCache.delete(key);
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

    // Deduplicate impressions per IP + placement within 5 minutes
    if (eventType === 'impression') {
      const dedupeKey = `${ip}:${placementId}`;
      const lastSeen = impressionCache.get(dedupeKey);
      const now = Date.now();

      if (lastSeen && now - lastSeen < IMPRESSION_DEDUPE_WINDOW) {
        // Already counted within the window
        return NextResponse.json({ tracked: false, reason: 'deduplicated' });
      }

      impressionCache.set(dedupeKey, now);
      
      // Clean up old entries periodically (1% chance per request)
      if (Math.random() < 0.01) {
        cleanupImpressionCache();
      }
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
