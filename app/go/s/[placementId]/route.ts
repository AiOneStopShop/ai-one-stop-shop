import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { affiliateRedirectRateLimit } from '@/lib/rate-limit';
import { getClientKey } from '@/lib/client-ip';
import { isBotClick, isInternalCheck, GO_NOINDEX_HEADERS } from '@/lib/click-context';

function redirect(to: URL | string) {
  const res = NextResponse.redirect(to, 302);
  for (const [k, v] of Object.entries(GO_NOINDEX_HEADERS)) res.headers.set(k, v);
  return res;
}

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
    const ip = getClientKey(request);
    const { success } = await affiliateRedirectRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: GO_NOINDEX_HEADERS }
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
      return redirect(new URL('/', request.url));
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
      return redirect(new URL('/', request.url));
    }

    // Increment click count; bots, prefetches and our own checks don't count.
    if (!isInternalCheck(request.method, request.headers) && !isBotClick(request.headers)) try {
      await supabase.rpc('increment_placement_event', {
        p_placement_id: placementId,
        p_event_type: 'click',
      });
    } catch (trackError) {
      // Log but don't fail the redirect
      console.error('Failed to track sponsor click:', trackError instanceof Error ? trackError.name : 'unknown');
    }

    // Redirect to sponsor link
    return redirect(placement.link_url);
  } catch (err) {
    console.error('Sponsor redirect error:', err instanceof Error ? err.name : 'unknown');
    return redirect(new URL('/', request.url));
  }
}

// HEAD (link checkers, our own routines): same redirect, never counted.
export const HEAD = GET;
