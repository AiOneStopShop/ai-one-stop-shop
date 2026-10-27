import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiMemoryBurst, apiRateLimit, isUpstashConfigured } from '@/lib/rate-limit';
import { getClientKey } from '@/lib/client-ip';
import { parseSearchLogPayload } from '@/lib/search-log';
import { parseStatsPayload, recordSiteEvent } from '@/lib/site-stats';

function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Privacy-safe search logging: stores only { query, result_count, created_at }.
 * The client key is used transiently for rate limiting and is never written to the database.
 * Inserts use the anon key; RLS allows INSERT only (no public read).
 */
export async function POST(request: NextRequest) {
  const limiter = isUpstashConfigured ? apiRateLimit : apiMemoryBurst;
  const { success } = await limiter.limit(`search-log:${getClientKey(request)}`);
  if (!success) return new NextResponse(null, { status: 204 });

  let body: unknown = null;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  // Aggregate count first: result bucket + category filter, never the text.
  const b = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  for (const { event, dimension } of parseStatsPayload({ event: 'search', count: b.count, category: b.category })) {
    await recordSiteEvent(event, dimension);
  }

  const row = parseSearchLogPayload(body);
  if (!row || !supabaseConfigured()) return new NextResponse(null, { status: 204 });

  const { error } = await supabase.from('search_queries').insert(row);
  if (error) console.warn('search log insert failed:', error.code);
  return new NextResponse(null, { status: 204 });
}
