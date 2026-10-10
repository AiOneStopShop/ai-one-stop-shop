import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await apiRateLimit.limit(`api-categories-${ip}`);
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');

    if (error) throw error;

    return NextResponse.json({
      categories: data || [],
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
