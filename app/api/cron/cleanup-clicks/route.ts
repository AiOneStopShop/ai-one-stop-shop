import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const header = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  const provided = Buffer.from(header);
  const wanted = Buffer.from(expected);
  if (provided.length !== wanted.length) {
    return false;
  }
  return timingSafeEqual(provided, wanted);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('delete_old_affiliate_clicks_http');

    if (error) {
      console.error('Click cleanup failed:', error);
      return NextResponse.json({ error: 'cleanup_failed' }, { status: 500 });
    }

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error('Click cleanup error:', error);
    return NextResponse.json({ error: 'cleanup_failed' }, { status: 500 });
  }
}
