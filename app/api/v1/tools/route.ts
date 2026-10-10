import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRateLimit } from '@/lib/rate-limit';

// Get client IP safely
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-real-ip') || request.ip || 'unknown';
}

// Escape SQL LIKE wildcards
function escapeLikePattern(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .substring(0, 100);
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = getClientIP(request);
  const { success } = await apiRateLimit.limit(`api-tools-${ip}`);
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rawSearch = searchParams.get('q');
    const search = rawSearch ? escapeLikePattern(rawSearch) : null;
    
    // Clamp limit to max 50
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50')), 50);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

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
      .eq('status', 'published');

    // Category filter
    if (category) {
      query = query.eq('tool_categories.categories.slug', category);
    }

    // Search filter using separate ilike calls (not building .or() from user input)
    if (search && search.length > 0) {
      const pattern = `%${search}%`;
      // Use three separate queries and combine results to avoid building SQL from user input
      const [nameResults, taglineResults, descResults] = await Promise.all([
        supabase.from('tools').select('id').eq('status', 'published').ilike('name', pattern).limit(limit * 3),
        supabase.from('tools').select('id').eq('status', 'published').ilike('tagline', pattern).limit(limit * 3),
        supabase.from('tools').select('id').eq('status', 'published').ilike('description', pattern).limit(limit * 3),
      ]);

      const matchingIds = new Set([
        ...(nameResults.data || []).map((t: any) => t.id),
        ...(taglineResults.data || []).map((t: any) => t.id),
        ...(descResults.data || []).map((t: any) => t.id),
      ]);

      if (matchingIds.size > 0) {
        query = query.in('id', Array.from(matchingIds));
      } else {
        // No matches, return empty
        return NextResponse.json({
          tools: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          },
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
          },
        });
      }
    }

    query = query
      .order('editorial_score', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('API tools query error:', error);
      throw error;
    }

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
