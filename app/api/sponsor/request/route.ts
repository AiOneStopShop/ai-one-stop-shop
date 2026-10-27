import { recordFormSuccess } from '@/lib/site-stats';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sponsorRequestRateLimit } from '@/lib/rate-limit';
import { getClientKey } from '@/lib/client-ip';
import { sendNotificationEmail } from '@/lib/notify-email';
import { buildSponsorRequestEmail } from '@/lib/sponsor-request-email';
import { getSiteContactEmail, getSiteUrl } from '@/lib/site-config';

interface RequestBody {
  companyName: string;
  contactName: string;
  email: string;
  toolName: string;
  toolUrl: string;
  package: string;
  message?: string;
  honeypot?: string;
}

const VALID_PACKAGES = ['featured-tool', 'category-spotlight', 'newsletter', 'founding-bundle', 'partner-program'];

export async function POST(request: NextRequest) {
  try {
    // Rate limit check (5 requests per IP per 15 minutes)
    const ip = getClientKey(request);
    const { success } = await sponsorRequestRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body: RequestBody = await request.json();

    // Honeypot check
    if (body.honeypot) {
      // Silent success for bots
      return NextResponse.json({ success: true });
    }

    // Validation
    if (!body.companyName || !body.contactName || !body.email || !body.toolName || !body.toolUrl || !body.package) {
      return NextResponse.json(
        { error: 'All required fields must be filled out.' },
        { status: 400 }
      );
    }

    if (!VALID_PACKAGES.includes(body.package)) {
      return NextResponse.json(
        { error: 'Invalid package selected.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // URL validation - only allow http and https schemes
    try {
      const url = new URL(body.toolUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'Only http:// and https:// URLs are allowed.' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Please enter a valid URL for your tool website.' },
        { status: 400 }
      );
    }

    // Store in database
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('sponsor_intake')
      .insert({
        company_name: body.companyName.trim().substring(0, 100),
        contact_name: body.contactName.trim().substring(0, 100),
        contact_email: body.email.trim().toLowerCase().substring(0, 255),
        tool_name: body.toolName.trim().substring(0, 100),
        tool_url: body.toolUrl.trim().substring(0, 500),
        package: body.package.replace(/-/g, '_'),
        blurb: body.message ? body.message.trim().substring(0, 500) : null,
        status: 'pending_review',
        agreed_to_terms: false,
        agreed_to_rights: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error storing sponsor request:', error.code);
      return NextResponse.json(
        { error: 'Failed to save your request. Please try again.' },
        { status: 500 }
      );
    }

    // Notification email via Resend (non-fatal). See lib/notify-email.ts for env vars
    // (RESEND_API_KEY, optional RESEND_FROM) and the logged error format.
    const contactEmail = getSiteContactEmail() ?? '';

    {
      const { subject, html, text } = buildSponsorRequestEmail({
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        toolName: body.toolName,
        toolUrl: body.toolUrl,
        package: body.package,
        message: body.message,
        submittedAt: new Date().toISOString(),
        siteUrl: getSiteUrl(),
      });

      await sendNotificationEmail({
        context: body.package === 'partner-program' ? 'partner-request' : 'sponsor-request',
        to: contactEmail,
        replyTo: body.email,
        subject,
        html,
        text,
      });
    }

    await recordFormSuccess('sponsor_request');
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Unexpected error in sponsor request:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
