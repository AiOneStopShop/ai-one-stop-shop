import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { z } from 'zod';
import { submitToolRateLimit } from '@/lib/rate-limit';

// Validation schema
const submitToolSchema = z.object({
  toolName: z.string().min(1).max(200),
  websiteUrl: z.string().url().refine((url) => {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  }, 'URL must use http or https protocol').max(500),
  contactEmail: z.string().email().max(200),
  description: z.string().max(2000).optional(),
  honeypot: z.string().optional(),
  turnstileToken: z.string().optional(),
});

// Get client IP safely
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown';
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // IMPORTANT: Turnstile is NOT wired to the submit form yet.
  // Leave TURNSTILE_SECRET_KEY unset at launch. Verification is skipped when unset.
  // Form does not send turnstileToken. Wire Turnstile widget to form before setting keys.
  if (!secret) return false;

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: ip,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting with Upstash
    const ip = getClientIP(request);
    const { success: rateLimitOk } = await submitToolRateLimit.limit(ip);
    
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const body = await request.json();
    
    // Validate with Zod
    const parsed = submitToolSchema.safeParse(body);
    
    if (!parsed.success) {
      // Log details server-side, return generic error to client
      console.error('Validation failed:', parsed.error.issues);
      return NextResponse.json(
        { error: 'Invalid submission data.' },
        { status: 400 }
      );
    }
    
    const { toolName, websiteUrl, contactEmail, description, honeypot, turnstileToken } = parsed.data;

    // Honeypot spam check
    if (honeypot) {
      console.warn('Honeypot triggered:', { ip, honeypot });
      return NextResponse.json(
        { error: 'Invalid submission.' },
        { status: 400 }
      );
    }

    // Turnstile verification when configured
    const turnstileConfigured = Boolean(process.env.TURNSTILE_SECRET_KEY);
    
    if (turnstileConfigured) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Verification required.' },
          { status: 400 }
        );
      }

      const verified = await verifyTurnstile(turnstileToken, ip);
      if (!verified) {
        console.warn('Turnstile verification failed:', { ip });
        return NextResponse.json(
          { error: 'Verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    const supabase = getServiceSupabase();

    // Insert into tool_submissions table
    // Status is forced to 'pending' by DB trigger, length constraints enforced by DB
    const { error } = await supabase
      .from('tool_submissions')
      .insert({
        tool_name: toolName,
        website_url: websiteUrl,
        contact_email: contactEmail,
        description: description || null,
      });

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit tool. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log details server-side, return generic error to client
    console.error('Submit tool error:', error);
    return NextResponse.json(
      { error: 'Failed to submit tool. Please try again.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
