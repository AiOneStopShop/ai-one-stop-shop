import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * Lightweight impression tracking endpoint.
 * Called when a sponsored placement is rendered.
 * No cookies, no IP storage, just aggregate counts.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placementId } = body;

    if (!placementId || typeof placementId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid placement ID' },
        { status: 400 }
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

    // Increment impression count
    const supabase = getServiceSupabase();
    await supabase.rpc('increment_placement_event', {
      p_placement_id: placementId,
      p_event_type: 'impression',
    });

    return NextResponse.json({ tracked: true });
  } catch (err) {
    console.error('Impression tracking error:', err);
    // Don't fail loudly - impressions are best-effort
    return NextResponse.json({ tracked: false }, { status: 200 });
  }
}
