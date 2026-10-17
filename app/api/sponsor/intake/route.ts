import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { submitToolRateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/client-ip';
import { getSiteContactEmail } from '@/lib/site-config';

const VALID_PACKAGES = ['featured_tool', 'category_spotlight', 'newsletter', 'founding_bundle'];

// Basic SVG sanitization: remove script tags and event handlers
function sanitizeSVG(svgContent: string): string {
  // Remove script tags
  let sanitized = svgContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
  
  return sanitized;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit check (5 requests per IP per hour)
    const ip = getClientIP(request);
    const { success } = await submitToolRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    // Honeypot check
    const honeypot = formData.get('honeypot');
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Extract and validate fields
    const companyName = formData.get('companyName')?.toString();
    const contactName = formData.get('contactName')?.toString();
    const email = formData.get('email')?.toString();
    const toolName = formData.get('toolName')?.toString();
    const toolUrl = formData.get('toolUrl')?.toString();
    const packageType = formData.get('package')?.toString();
    const preferredStartDate = formData.get('preferredStartDate')?.toString();
    const categorySlug = formData.get('categorySlug')?.toString();
    const blurb = formData.get('blurb')?.toString();
    const logoUrl = formData.get('logoUrl')?.toString();
    const logoFile = formData.get('logoFile') as File | null;
    const destinationUrl = formData.get('destinationUrl')?.toString();
    const targetsChildren = formData.get('targetsChildren') === 'true';
    const agreedToTerms = formData.get('agreedToTerms') === 'true';
    const agreedToRights = formData.get('agreedToRights') === 'true';

    // Required field validation
    if (!companyName || !contactName || !email || !toolName || !toolUrl || 
        !packageType || !preferredStartDate || !blurb || !destinationUrl) {
      return NextResponse.json(
        { error: 'All required fields must be filled out.' },
        { status: 400 }
      );
    }

    if (!VALID_PACKAGES.includes(packageType)) {
      return NextResponse.json(
        { error: 'Invalid package selected.' },
        { status: 400 }
      );
    }

    if (!agreedToTerms || !agreedToRights) {
      return NextResponse.json(
        { error: 'You must agree to both checkboxes.' },
        { status: 400 }
      );
    }

    if (targetsChildren) {
      return NextResponse.json(
        { error: 'We cannot accept sponsorships for tools targeting children under 13.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // URL validation
    try {
      new URL(toolUrl);
      new URL(destinationUrl);
      if (logoUrl) new URL(logoUrl);
    } catch {
      return NextResponse.json(
        { error: 'Please enter valid URLs.' },
        { status: 400 }
      );
    }

    // Handle logo file upload if provided
    let logoFilePath: string | null = null;
    if (logoFile && logoFile.size > 0) {
      // Validate file size (200KB)
      if (logoFile.size > 200 * 1024) {
        return NextResponse.json(
          { error: 'Logo file must be under 200KB.' },
          { status: 400 }
        );
      }

      // Validate file type
      const validTypes = ['image/png', 'image/svg+xml'];
      if (!validTypes.includes(logoFile.type)) {
        return NextResponse.json(
          { error: 'Logo must be PNG or SVG.' },
          { status: 400 }
        );
      }

      try {
        const supabase = getServiceSupabase();
        const timestamp = Date.now();
        const safeName = toolName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const ext = logoFile.type === 'image/svg+xml' ? 'svg' : 'png';
        const fileName = `${safeName}-${timestamp}.${ext}`;

        let fileContent = await logoFile.arrayBuffer();

        // Sanitize SVG if needed
        if (logoFile.type === 'image/svg+xml') {
          const textContent = new TextDecoder().decode(fileContent);
          const sanitized = sanitizeSVG(textContent);
          fileContent = new TextEncoder().encode(sanitized).buffer;
        }

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('sponsor-assets')
          .upload(fileName, fileContent, {
            contentType: logoFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          return NextResponse.json(
            { error: 'Failed to upload logo. Please try again.' },
            { status: 500 }
          );
        }

        logoFilePath = uploadData.path;
      } catch (uploadErr) {
        console.error('Logo upload exception:', uploadErr);
        return NextResponse.json(
          { error: 'Failed to upload logo. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Store in database
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('sponsor_intake')
      .insert({
        company_name: companyName.trim().substring(0, 100),
        contact_name: contactName.trim().substring(0, 100),
        contact_email: email.trim().toLowerCase().substring(0, 255),
        tool_name: toolName.trim().substring(0, 100),
        tool_url: toolUrl.trim().substring(0, 500),
        package: packageType,
        preferred_start_date: preferredStartDate,
        category_slug: categorySlug || null,
        blurb: blurb.trim().substring(0, 240),
        logo_url: logoUrl?.trim().substring(0, 500) || null,
        logo_file_path: logoFilePath,
        destination_url: destinationUrl.trim().substring(0, 500),
        targets_children: targetsChildren,
        agreed_to_terms: agreedToTerms,
        agreed_to_rights: agreedToRights,
        status: 'pending_review',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error storing sponsor intake:', error);
      return NextResponse.json(
        { error: 'Failed to save your submission. Please try again.' },
        { status: 500 }
      );
    }

    // Send notification email via Resend (if API key is configured)
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = getSiteContactEmail();

    if (resendApiKey && contactEmail) {
      try {
        const packageLabels: Record<string, string> = {
          'featured_tool': 'Featured Tool ($39)',
          'category_spotlight': 'Category Spotlight ($69)',
          'newsletter': 'Newsletter Sponsor ($29)',
          'founding_bundle': 'Founding Bundle ($99)',
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
            reply_to: email,
            subject: `Sponsor intake form: ${toolName} (${packageLabels[packageType]})`,
            html: `
              <h2>Sponsor Intake Form Submitted</h2>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Contact:</strong> ${contactName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Tool:</strong> ${toolName}</p>
              <p><strong>URL:</strong> <a href="${toolUrl}">${toolUrl}</a></p>
              <p><strong>Package:</strong> ${packageLabels[packageType]}</p>
              <p><strong>Preferred start:</strong> ${preferredStartDate}</p>
              ${categorySlug ? `<p><strong>Category:</strong> ${categorySlug}</p>` : ''}
              <p><strong>Blurb:</strong><br>${blurb.replace(/\n/g, '<br>')}</p>
              <p><strong>Destination URL:</strong> <a href="${destinationUrl}">${destinationUrl}</a></p>
              ${logoUrl ? `<p><strong>Logo URL:</strong> ${logoUrl}</p>` : ''}
              ${logoFilePath ? `<p><strong>Logo file:</strong> ${logoFilePath}</p>` : ''}
              <hr>
              <p><small>Submitted at ${new Date().toISOString()}</small></p>
              <p><small>Review in admin: <a href="https://aionestop.shop/admin/sponsors">/admin/sponsors</a></small></p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('Resend API error:', errorData);
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
      }
    } else {
      console.warn('RESEND_API_KEY or NEXT_PUBLIC_SITE_CONTACT_EMAIL not set, skipping notification email');
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Unexpected error in sponsor intake:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
