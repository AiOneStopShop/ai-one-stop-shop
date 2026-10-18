import { NextRequest, NextResponse } from 'next/server';
import { searchPublishedCatalog } from '@/lib/search-catalog';
import { sanitizeSearchQuery } from '@/lib/search-tools';

export const runtime = 'nodejs';

const SUGGEST_LIMIT = 6;

/** Instant suggestions for the search combobox. Read-only, edge-cacheable, no logging. */
export async function GET(request: NextRequest) {
  const q = sanitizeSearchQuery(request.nextUrl.searchParams.get('q'));
  if (q.length < 2) {
    return NextResponse.json({ q, total: 0, suggestions: [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  }

  try {
    const result = await searchPublishedCatalog({ q, limit: SUGGEST_LIMIT });
    const suggestions = (result.tools as Array<{ slug?: string; name?: string; tagline?: string | null }>)
      .filter((tool) => tool.slug && tool.name)
      .slice(0, SUGGEST_LIMIT)
      .map((tool) => ({ slug: tool.slug, name: tool.name, tagline: tool.tagline ?? '' }));
    return NextResponse.json({ q, total: result.total ?? suggestions.length, suggestions }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    });
  } catch {
    return NextResponse.json({ q, total: 0, suggestions: [] }, { status: 200 });
  }
}
