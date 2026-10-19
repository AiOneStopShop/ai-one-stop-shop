import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/supabase';
import { newsletterRateLimit } from '@/lib/rate-limit';
import { getClientKey } from '@/lib/client-ip';

const schema = z.object({
  email: z.string().trim().email().max(254),
  // The client runs the age check before sending anything. The birth year itself is never
  // sent or stored; the client only confirms the check passed and consent was given.
  age_ok: z.literal(true),
  consent: z.literal(true),
  website: z.string().optional(), // honeypot
  source: z.enum(['newsletter_page', 'home', 'tool_page', 'tools_list']).optional(),
});

export async function POST(request: NextRequest) {
  const { success } = await newsletterRateLimit.limit(`newsletter-${getClientKey(request)}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again in 15 minutes.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  // Bots fill the hidden field; answer like a success and store nothing.
  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from('newsletter_signups')
      .insert({ email: parsed.data.email.toLowerCase(), source: parsed.data.source ?? 'newsletter_page' });

    // 23505 = already on the list. Same answer, so the form can't be used to test addresses.
    if (error && error.code !== '23505') {
      console.error('newsletter signup failed:', error.code);
      return NextResponse.json(
        { error: "We couldn't save that right now. Please email us instead." },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "We couldn't save that right now. Please email us instead." },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true });
}
