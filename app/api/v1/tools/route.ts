import { NextRequest, NextResponse } from 'next/server';
import { apiMemoryBurst, apiRateLimit, isUpstashConfigured } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/client-ip';
import { toPublicTool } from '@/lib/public-tool';
import { searchPublishedCatalog } from '@/lib/search-catalog';
import { sanitizeSearchQuery } from '@/lib/search-tools';

const CORS_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const limiter = isUpstashConfigured ? apiRateLimit : apiMemoryBurst;
  const { success } = await limiter.limit(`api-tools-${ip}`);

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

    const result = await searchPublishedCatalog({
      q,
      category,
      price,
      freeOnly,
      limit,
      offset,
    });

    return jsonTools(result.tools.map((tool: any) => toPublicTool(tool)), result.total, limit, offset);
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
