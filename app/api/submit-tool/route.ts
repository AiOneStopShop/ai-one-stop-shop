import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema
const submitToolSchema = z.object({
  toolName: z.string().min(1).max(100),
  websiteUrl: z.string().url().refine((url) => {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  }, 'URL must use http or https protocol').max(500),
  contactEmail: z.string().email().max(255),
  description: z.string().max(1000).optional(),
  honeypot: z.string().optional(),
  // Optional Turnstile token
  turnstileToken: z.string().optional(),
});

// Simple in-memory rate limiting (use Upstash Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit: number = 3, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const parsed = submitToolSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { toolName, websiteUrl, contactEmail, description, honeypot, turnstileToken } = parsed.data;

    // Honeypot spam check
    if (honeypot) {
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = getClientIP(request);
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      );
    }

    // Optional: Verify Cloudflare Turnstile token if configured
    if (process.env.TURNSTILE_SECRET_KEY && turnstileToken) {
      const turnstileRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
            remoteip: ip,
          }),
        }
      );

      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        return NextResponse.json(
          { error: 'Verification failed' },
          { status: 400 }
        );
      }
    }

    const supabase = getServiceSupabase();

    // Insert into tool_submissions table
    // Status is forced to 'pending' by the DB (check constraint or default)
    const { error } = await supabase
      .from('tool_submissions')
      .insert({
        tool_name: toolName.substring(0, 100),
        website_url: websiteUrl.substring(0, 500),
        contact_email: contactEmail.substring(0, 255),
        description: description ? description.substring(0, 1000) : null,
      });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to submit tool' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit tool' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
