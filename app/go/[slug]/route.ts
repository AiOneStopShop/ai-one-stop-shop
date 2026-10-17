import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { affiliateRedirectRateLimit, dedupe } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/client-ip';
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
  const ip = getClientIP(request);
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

    let destination = link?.destination_url || null;
    let toolId = link?.tool_id || null;
    let linkId = link?.id || null;

    if (error || !link) {
      const { data: tool } = await supabase
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

    // Log click asynchronously using after() to avoid blocking the redirect
    after(async () => {
      try {
        if (!toolId) return;
        
        const ipHash = hashIP(ip);
        
        // Deduplicate clicks per IP hash + tool + day
        const today = new Date().toISOString().split('T')[0];
        const dedupeKey = `dedupe:click:${ipHash}:${toolId}:${today}`;
        
        const isFirstClick = await dedupe(dedupeKey, 86400); // 24 hours
        
        if (!isFirstClick) {
          // Already logged this click today
          return;
        }

        await supabase.from('affiliate_clicks').insert({
          link_id: linkId,
          tool_id: toolId,
          ip_hash: ipHash,
          user_agent: userAgent?.substring(0, 255),
          referrer: referrerOrigin + referrerPathname,
          page_path: referrerPathname,
          is_bot: isBot(userAgent),
        });
      } catch (err) {
        console.error('Failed to log affiliate click:', err);
      }
    });

    return NextResponse.redirect(destination, 302);
  } catch (error) {
    console.error('Error in /go redirect:', error);
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}
