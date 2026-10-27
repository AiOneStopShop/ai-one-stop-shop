import { recordFormSuccess } from '@/lib/site-stats';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { z } from 'zod';
import { submitToolRateLimit } from '@/lib/rate-limit';
import { getClientKey } from '@/lib/client-ip';

const FIELD_ERROR_CODES = [
  'name_missing',
  'url_invalid',
  'email_invalid',
  'too_long',
  'rights_required',
] as const;

type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

function isHttpOrHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const submitToolSchema = z.object({
  toolName: z.string().min(1).max(200),
  websiteUrl: z.string().max(500).refine(isHttpOrHttpsUrl),
  contactEmail: z.string().email().max(200),
  description: z.string().max(2000).optional(),
  rightsConfirmed: z.boolean().optional(),
  extra_ref: z.string().optional(),
});

function mapZodIssues(issues: z.ZodIssue[]): { field: string; code: FieldErrorCode }[] {
  const errors: { field: string; code: FieldErrorCode }[] = [];

  for (const issue of issues) {
    const field = String(issue.path[0] || '');

    if (issue.code === 'too_big') {
      errors.push({ field, code: 'too_long' });
      continue;
    }

    if (field === 'toolName') {
      errors.push({ field, code: 'name_missing' });
    } else if (field === 'websiteUrl') {
      errors.push({ field, code: 'url_invalid' });
    } else if (field === 'contactEmail') {
      errors.push({ field, code: 'email_invalid' });
    }
  }

  return errors;
}

const NEUTRAL_SUCCESS = { success: true };

export async function POST(request: NextRequest) {
  try {
    const ip = getClientKey(request);
    const { success: rateLimitOk } = await submitToolRateLimit.limit(ip);

    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'too_many' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const body = await request.json();
    const parsed = submitToolSchema.safeParse(body);

    if (!parsed.success) {
      console.error('Validation failed:', parsed.error.issues.map((i) => i.path.join('.')).join(','));
      return NextResponse.json(
        { errors: mapZodIssues(parsed.error.issues) },
        { status: 400 }
      );
    }

    const { toolName, websiteUrl, contactEmail, description, rightsConfirmed, extra_ref } = parsed.data;

    // When LEGAL_V2 flag is enabled, enforce the rights checkbox server-side
    if (process.env.NEXT_PUBLIC_LEGAL_V2 === 'true' && !rightsConfirmed) {
      return NextResponse.json(
        { errors: [{ field: 'rightsConfirmed', code: 'rights_required' }] },
        { status: 400 }
      );
    }

    // Honeypot: same success body as a real submit so bots cannot probe
    if (extra_ref) {
      console.warn('Honeypot triggered');
      return NextResponse.json(NEUTRAL_SUCCESS);
    }

    // Turnstile stays unset this round. Do not require or verify a token.

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('tool_submissions')
      .insert({
        tool_name: toolName,
        website_url: websiteUrl,
        contact_email: contactEmail,
        description: description || null,
      });

    if (error) {
      console.error('Database insert error:', error.code);
      return NextResponse.json(
        { error: 'submit_failed' },
        { status: 500 }
      );
    }

    await recordFormSuccess('submit_tool');
    return NextResponse.json(NEUTRAL_SUCCESS);
  } catch (error) {
    console.error('Submit tool error:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json(
      { error: 'submit_failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
