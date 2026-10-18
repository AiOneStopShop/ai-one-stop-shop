import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sponsorRequestRateLimit } from '@/lib/rate-limit';
import { getClientKey } from '@/lib/client-ip';
import { sendNotificationEmail } from '@/lib/notify-email';
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
      console.error('Database error storing sponsor request:', error);
      return NextResponse.json(
        { error: 'Failed to save your request. Please try again.' },
        { status: 500 }
      );
    }

    // Notification email via Resend (non-fatal). See lib/notify-email.ts for env vars
    // (RESEND_API_KEY, optional RESEND_FROM) and the logged error format.
    const contactEmail = getSiteContactEmail() ?? '';

    {
      const packageLabels: Record<string, string> = {
        'featured-tool': 'Featured Tool ($39)',
        'category-spotlight': 'Category Spotlight ($69)',
        'newsletter': 'Newsletter Sponsor ($29)',
        'founding-bundle': 'Founding Bundle ($99)',
        'partner-program': 'Partner Program',
      };

      // HTML-escape helper
      const escapeHtml = (text: string) => 
        text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

      await sendNotificationEmail({
        context: 'sponsor-request',
        to: contactEmail,
        replyTo: body.email,
        subject: `New sponsor request: ${escapeHtml(body.toolName)} (${packageLabels[body.package] || body.package})`,
        html: `
          <h2>New Sponsor Request</h2>
          <p><strong>Company:</strong> ${escapeHtml(body.companyName)}</p>
          <p><strong>Contact:</strong> ${escapeHtml(body.contactName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
          <p><strong>Tool:</strong> ${escapeHtml(body.toolName)}</p>
          <p><strong>URL:</strong> <a href="${escapeHtml(body.toolUrl)}">${escapeHtml(body.toolUrl)}</a></p>
          <p><strong>Package:</strong> ${packageLabels[body.package] || body.package}</p>
          ${body.message ? `<p><strong>Message:</strong><br>${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>` : ''}
          <hr>
          <p><small>Submitted at ${new Date().toISOString()}</small></p>
          <p><small>Review in admin: <a href="${getSiteUrl().replace(/\/$/, '')}/admin/sponsors">/admin/sponsors</a></small></p>
        `,
      });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Unexpected error in sponsor request:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
