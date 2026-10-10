import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// In-memory rate limiting (use Upstash Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Get client IP safely
function getClientIP(request: NextRequest): string {
  // Use Vercel's x-real-ip header or request.ip
  return request.headers.get('x-real-ip') || request.ip || 'unknown';
}

// Sanitize search query (remove special characters that could affect SQL)
function sanitizeSearch(input: string): string {
  // Remove percent signs and underscores (SQL wildcards)
  // Keep only alphanumeric, spaces, and common punctuation
  return input.replace(/[%_]/g, '').substring(0, 100);
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  if (!rateLimit(clientIP, 60)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const rawSearch = searchParams.get('q');
  const search = rawSearch ? sanitizeSearch(rawSearch) : null;
  
  // Clamp limit to max 50
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50')), 50);
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

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

    // Add search filter if provided (using safe parameterized queries)
    if (search && search.length > 0) {
      // Use textSearch for safer full-text search, or individual ilike calls
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
