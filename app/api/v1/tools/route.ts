import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const search = searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let query = supabase
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
        tool_categories(
          categories(id, slug, name, icon)
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('editorial_score', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the data to flatten categories
    const tools = (data || []).map((tool: any) => ({
      ...tool,
      categories: tool.tool_categories?.map((tc: any) => tc.categories).filter(Boolean) || [],
      tool_categories: undefined,
    }));

    return NextResponse.json({
      tools,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
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
