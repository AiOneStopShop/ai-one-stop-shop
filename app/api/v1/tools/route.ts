import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/client-ip';
import { fallbackTools } from '@/lib/fallback-data';
import { sanitizeSearchQuery, searchTools } from '@/lib/search-tools';

const CORS_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function jsonTools(tools: any[], total: number, limit: number, offset: number) {
  return NextResponse.json({
    tools,
    pagination: {
      total,
      limit,
      offset,
      hasMore: (offset + limit) < total,
    },
  }, { headers: CORS_HEADERS });
}

function flattenCategories(tool: any) {
  return {
    ...tool,
    categories: tool.tool_categories?.map((tc: any) => tc.categories).filter(Boolean) || [],
    tool_categories: undefined,
    search_rank: undefined,
    result_total: undefined,
    search_vector: undefined,
    search_categories: undefined,
  };
}

async function attachCategories(rows: any[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const { data } = await supabase
    .from('tool_categories')
    .select('tool_id, is_primary, categories(id, slug, name, icon)')
    .in('tool_id', ids);

  const byTool = new Map<string, any[]>();
  for (const relation of data || []) {
    const list = byTool.get(relation.tool_id) || [];
    list.push(relation);
    byTool.set(relation.tool_id, list);
  }

  return rows.map((row) => flattenCategories({
    ...row,
    tool_categories: byTool.get(row.id) || [],
  }));
}

async function searchPublishedInMemory(
  q: string,
  category: string | null,
  price: string | null,
  freeOnly: boolean,
  limit: number,
  offset: number
) {
  const { data } = await supabase
    .from('tools')
    .select(`
      id,
      slug,
      name,
      tagline,
      description,
      website_url,
      pricing_summary,
      pricing_model,
      has_free_tier,
      platforms,
      features,
      editorial_score,
      last_verified_at,
      is_sponsored,
      created_at,
      updated_at,
      status,
      tool_categories(
        categories(id, slug, name, icon)
      )
    `)
    .eq('status', 'published');

  const source = (data && data.length > 0)
    ? data
    : fallbackTools.filter((tool) => tool.status === 'published');

  const matched = searchTools(source, {
    q,
    category: category || undefined,
    price: price || undefined,
    freeOnly,
  });
  const page = matched.slice(offset, offset + limit);
  return jsonTools(page.map(flattenCategories), matched.length, limit, offset);
}

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const { success } = await apiRateLimit.limit(`api-tools-${ip}`);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const price = searchParams.get('price');
    const freeOnly = searchParams.get('free') === '1' || searchParams.get('free_only') === '1';
    const q = sanitizeSearchQuery(searchParams.get('q'));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50), 50);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);
    const supabaseConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (supabaseConfigured) {
      const { data, error } = await supabase.rpc('search_tools', {
        q,
        category: category || null,
        price: price || null,
        free_only: freeOnly,
        limit,
        offset,
      });

      if (!error && Array.isArray(data)) {
        const total = data[0]?.result_total ?? data.length;
        const tools = await attachCategories(data);
        return jsonTools(tools, total, limit, offset);
      }
    }

    return await searchPublishedInMemory(q, category, price, freeOnly, limit, offset);
  } catch (error) {
    console.error('Failed to fetch tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const runtime = 'nodejs';
