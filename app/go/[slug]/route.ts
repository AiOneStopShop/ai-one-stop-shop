import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { affiliateRedirectRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

// Hash IP address for privacy
function hashIP(ip: string): string {
  const secret = process.env.AFFILIATE_CLICK_SECRET;
  if (!secret) {
    throw new Error('AFFILIATE_CLICK_SECRET not configured');
  }
  return crypto.createHmac('sha256', secret).update(ip).digest('hex');
}

// Simple bot detection
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  const botPatterns = /bot|crawler|spider|scraper|curl|wget|python-requests/i;
  return botPatterns.test(userAgent);
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const { slug } = params;

  // Rate limiting with Upstash
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const { success: rateLimitOk } = await affiliateRedirectRateLimit.limit(ip);
  
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabase = getServiceSupabase();

    // Look up the affiliate link and ensure tool is published
    const { data: link, error } = await supabase
      .from('affiliate_links')
      .select(`
        id,
        tool_id,
        destination_url,
        is_active,
        tools!inner(status)
      `)
      .eq('go_slug', slug)
      .eq('is_active', true)
      .eq('tools.status', 'published')
      .single();

    if (error || !link) {
      return NextResponse.redirect(new URL('/', request.url), 302);
    }

    // Get user agent for logging
    const userAgent = request.headers.get('user-agent');
    const ipHash = hashIP(ip);
    const botDetected = isBot(userAgent);

    // Log the click (async, don't wait)
    const referrer = request.headers.get('referer') || '';
    const referrerUrl = referrer ? new URL(referrer) : null;
    
    // Fire and forget - log the click
    void (async () => {
      try {
        await supabase
          .from('affiliate_clicks')
          .insert({
            link_id: link.id,
            tool_id: link.tool_id,
            ip_hash: ipHash,
            user_agent: userAgent?.substring(0, 255),
            referrer: referrerUrl ? `${referrerUrl.origin}${referrerUrl.pathname}` : '',
            page_path: referrerUrl?.pathname || '',
            is_bot: botDetected,
          });
      } catch (err) {
        console.error('Failed to log affiliate click:', err);
      }
    })();

    // Redirect to the destination
    return NextResponse.redirect(link.destination_url, 302);
  } catch (error) {
    console.error('Error in /go redirect:', error);
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
