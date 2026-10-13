import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('llm_pricing')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching LLM pricing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
