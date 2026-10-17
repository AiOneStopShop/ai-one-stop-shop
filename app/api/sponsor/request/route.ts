import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { submitToolRateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/client-ip';
import { getSiteContactEmail } from '@/lib/site-config';

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

const VALID_PACKAGES = ['featured-tool', 'category-spotlight', 'newsletter', 'founding-bundle'];

export async function POST(request: NextRequest) {
  try {
    // Rate limit check (5 requests per IP per 15 minutes)
    const ip = getClientIP(request);
    const { success } = await submitToolRateLimit.limit(ip);

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

    // URL validation
    try {
      new URL(body.toolUrl);
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
        package: body.package === 'founding-bundle' ? 'founding_bundle' : body.package.replace('-', '_'),
        blurb: body.message ? body.message.trim().substring(0, 500) : null,
        status: 'pending_review',
        agreed_to_terms: true,
        agreed_to_rights: true,
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

    // Send notification email via Resend (if API key is configured)
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = getSiteContactEmail();

    if (resendApiKey && contactEmail) {
      try {
        const packageLabels: Record<string, string> = {
          'featured-tool': 'Featured Tool ($39)',
          'category-spotlight': 'Category Spotlight ($69)',
          'newsletter': 'Newsletter Sponsor ($29)',
          'founding-bundle': 'Founding Bundle ($99)',
        };

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'aionestopshop25@gmail.com',
            to: [contactEmail],
            reply_to: body.email,
            subject: `New sponsor request: ${body.toolName} (${packageLabels[body.package] || body.package})`,
            html: `
              <h2>New Sponsor Request</h2>
              <p><strong>Company:</strong> ${body.companyName}</p>
              <p><strong>Contact:</strong> ${body.contactName}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Tool:</strong> ${body.toolName}</p>
              <p><strong>URL:</strong> <a href="${body.toolUrl}">${body.toolUrl}</a></p>
              <p><strong>Package:</strong> ${packageLabels[body.package] || body.package}</p>
              ${body.message ? `<p><strong>Message:</strong><br>${body.message.replace(/\n/g, '<br>')}</p>` : ''}
              <hr>
              <p><small>Submitted at ${new Date().toISOString()}</small></p>
              <p><small>Review in admin: <a href="https://aionestop.shop/admin/sponsors">/admin/sponsors</a></small></p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('Resend API error:', errorData);
          // Don't fail the request if email fails, just log it
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.warn('RESEND_API_KEY or NEXT_PUBLIC_SITE_CONTACT_EMAIL not set, skipping notification email');
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
