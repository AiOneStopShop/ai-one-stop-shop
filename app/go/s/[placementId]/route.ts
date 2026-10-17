import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { affiliateRedirectRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/client-ip';

/**
 * Sponsor link redirect with click tracking.
 * Route: /go/s/[placementId]
 * 
 * Tracks clicks through the placement_events table, then redirects.
 * Rate limited to prevent abuse.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ placementId: string }> }
) {
  const { placementId } = await context.params;

  try {
    // Rate limit check
    const ip = getClientIp(request);
    const { success } = await affiliateRedirectRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Get the placement to redirect to
    const supabase = getServiceSupabase();
    const { data: placement, error } = await supabase
      .from('sponsor_placements')
      .select('link_url, status, starts_at, ends_at')
      .eq('id', placementId)
      .single();

    if (error || !placement) {
      return NextResponse.redirect(new URL('/', request.url), 302);
    }

    // Verify placement is live and within date range
    const now = new Date();
    const startsAt = new Date(placement.starts_at);
    const endsAt = new Date(placement.ends_at);

    if (
      placement.status !== 'live' ||
      now < startsAt ||
      now > endsAt
    ) {
      return NextResponse.redirect(new URL('/', request.url), 302);
    }

    // Increment click count (using the helper function)
    try {
      await supabase.rpc('increment_placement_event', {
        p_placement_id: placementId,
        p_event_type: 'click',
      });
    } catch (trackError) {
      // Log but don't fail the redirect
      console.error('Failed to track sponsor click:', trackError);
    }

    // Redirect to sponsor link
    return NextResponse.redirect(placement.link_url, 302);
  } catch (err) {
    console.error('Sponsor redirect error:', err);
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}
