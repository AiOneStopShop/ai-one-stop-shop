import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { supabase as publicSupabase, getServiceSupabase } from '@/lib/supabase';
import { affiliateRedirectRateLimit, dedupe, releaseDedupe } from '@/lib/rate-limit';
import { logAffiliateClick } from '@/lib/click-logging';
import { getClientKey } from '@/lib/client-ip';
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
  const ip = getClientKey(request);
  const { success: rateLimitOk } = await affiliateRedirectRateLimit.limit(ip);
  
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Destination lookups use the public (anon) client: published tools and
    // active affiliate links are readable under RLS. The redirect must not
    // depend on the service-role key; that key is only needed to log the click.
    const { data: link, error } = await publicSupabase
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

    let destination = link?.destination_url || null;
    let toolId = link?.tool_id || null;
    let linkId = link?.id || null;

    if (error || !link) {
      const { data: tool } = await publicSupabase
        .from('tools')
        .select('id, website_url')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (!tool?.website_url) {
        return NextResponse.redirect(new URL('/', request.url), 302);
      }
      destination = tool.website_url;
      toolId = tool.id;
    }

    const userAgent = request.headers.get('user-agent');
    
    // Parse referrer safely
    const referrer = request.headers.get('referer') || '';
    let referrerOrigin = '';
    let referrerPathname = '';
    
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        referrerOrigin = referrerUrl.origin;
        referrerPathname = referrerUrl.pathname;
      } catch (err) {
        // Malformed referrer, ignore
        console.warn('Malformed referrer:', referrer);
      }
    }

    // Only redirect to absolute http(s) URLs that came from the database.
    let safeDestination: URL;
    try {
      safeDestination = new URL(destination as string);
    } catch {
      return NextResponse.redirect(new URL('/', request.url), 302);
    }
    if (safeDestination.protocol !== 'https:' && safeDestination.protocol !== 'http:') {
      return NextResponse.redirect(new URL('/', request.url), 302);
    }

    // Log the click after the response is sent. after() runs the callback inside
    // the platform's waitUntil, so the function stays alive until it settles.
    after(() =>
      logAffiliateClick(
        {
          ip,
          toolId,
          linkId,
          userAgent,
          referrerOrigin,
          referrerPathname,
          isBot: isBot(userAgent),
        },
        {
          hashIp: hashIP,
          dedupe,
          releaseDedupe,
          insert: async (row) => {
            const { error } = await getServiceSupabase().from('affiliate_clicks').insert(row);
            return { error };
          },
        }
      ).then(() => undefined)
    );

    return NextResponse.redirect(safeDestination, 302);
  } catch (error) {
    console.error('Error in /go redirect:', error);
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}
