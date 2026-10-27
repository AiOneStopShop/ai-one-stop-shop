import { NextRequest, NextResponse } from 'next/server';
import { apiMemoryBurst, apiRateLimit, isUpstashConfigured } from '@/lib/rate-limit';
import { getClientKey } from '@/lib/client-ip';
import { parseStatsPayload, recordSiteEvent } from '@/lib/site-stats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Aggregate usage counts (tool finder). Accepts only allow-listed labels and
 * stores a daily counter; the client key is used transiently for rate limiting
 * and is never stored or logged.
 */
export async function POST(request: NextRequest) {
  const limiter = isUpstashConfigured ? apiRateLimit : apiMemoryBurst;
  const { success } = await limiter.limit(`stats:${getClientKey(request)}`);
  if (!success) return new NextResponse(null, { status: 204 });

  let body: unknown = null;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  for (const { event, dimension } of parseStatsPayload(body)) {
    if (event === 'finder') await recordSiteEvent(event, dimension);
  }
  return new NextResponse(null, { status: 204 });
}
