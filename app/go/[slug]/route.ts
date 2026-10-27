import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { supabase as publicSupabase, getServiceSupabase } from '@/lib/supabase';
import { affiliateRedirectRateLimit } from '@/lib/rate-limit';
import { logAffiliateClick } from '@/lib/click-logging';
import { getClientKey } from '@/lib/client-ip';
import { clickContext, isBotRequest } from '@/lib/click-context';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const { slug } = params;

  // Rate limiting with Upstash. The client key is used only for this check and
  // is never stored with the click or logged.
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
    
    // Page the click came from + referring site (origin only for other sites; no query/PII).
    const { referrer, pagePath } = clickContext(
      request.headers.get('referer'),
      request.nextUrl.searchParams.get('from'),
      request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host')
    );

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
          toolId,
          linkId,
          referrer,
          pagePath,
          isBot: isBotRequest(userAgent, request.headers.get('accept-language')),
        },
        {
          insert: async (row) => {
            const { error } = await getServiceSupabase().from('affiliate_clicks').insert(row);
            return { error };
          },
        }
      ).then(() => undefined)
    );

    return NextResponse.redirect(safeDestination, 302);
  } catch (error) {
    console.error('Error in /go redirect:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}
