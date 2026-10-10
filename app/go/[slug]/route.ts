import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import crypto from 'crypto';

// Rate limiting helper (basic in-memory - use Upstash Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ipHash: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ipHash);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

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
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

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

    // Get IP and user agent for logging
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent');
    const ipHash = hashIP(ip);
    const botDetected = isBot(userAgent);

    // Rate limiting
    if (!rateLimit(ipHash)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

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
