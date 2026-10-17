import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { placementTrackRateLimit, dedupe } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/client-ip';
import { createHash } from 'crypto';

function hashIP(ip: string): string {
  const secret = process.env.AFFILIATE_CLICK_SECRET || '';
  if (!secret) {
    throw new Error('AFFILIATE_CLICK_SECRET is required');
  }
  return createHash('sha256').update(ip + secret).digest('hex');
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

    // Validate placementId as UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(placementId)) {
      return NextResponse.json(
        { error: 'Invalid placement ID format' },
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

    // Verify placement is live before deduping or counting
    const supabase = getServiceSupabase();
    const { data: placement } = await supabase
      .from('public_live_placements')
      .select('id')
      .eq('id', placementId)
      .single();

    if (!placement) {
      return NextResponse.json({ tracked: false, reason: 'inactive' });
    }

    // Deduplicate events per IP hash + placement + event type + day using Redis
    const ipHash = hashIP(ip);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dedupeKey = `dedupe:placement:${ipHash}:${placementId}:${eventType}:${today}`;
    
    try {
      const isFirstOccurrence = await dedupe(dedupeKey, 86400); // 24 hours
      
      if (!isFirstOccurrence) {
        // Already counted today
        return NextResponse.json({ tracked: false, reason: 'deduplicated' });
      }
    } catch (err) {
      // In production without Redis, dedupe throws - fail the request
      console.error('Deduplication error:', err);
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
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
