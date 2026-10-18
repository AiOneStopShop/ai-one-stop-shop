import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { submitToolRateLimit } from '@/lib/rate-limit';
import { getClientKey } from '@/lib/client-ip';
import { sendNotificationEmail } from '@/lib/notify-email';
import { getSiteContactEmail } from '@/lib/site-config';

const VALID_PACKAGES = ['featured_tool', 'category_spotlight', 'newsletter', 'founding_bundle'];

// Magic byte signatures for image validation
const IMAGE_SIGNATURES = {
  png: [0x89, 0x50, 0x4E, 0x47],
  jpg: [0xFF, 0xD8, 0xFF],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF (WebP container)
};

function validateImageMagicBytes(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  
  // Check PNG
  if (bytes.length >= 4 && 
      bytes[0] === IMAGE_SIGNATURES.png[0] &&
      bytes[1] === IMAGE_SIGNATURES.png[1] &&
      bytes[2] === IMAGE_SIGNATURES.png[2] &&
      bytes[3] === IMAGE_SIGNATURES.png[3]) {
    return true;
  }
  
  // Check JPEG
  if (bytes.length >= 3 && 
      bytes[0] === IMAGE_SIGNATURES.jpg[0] &&
      bytes[1] === IMAGE_SIGNATURES.jpg[1] &&
      bytes[2] === IMAGE_SIGNATURES.jpg[2]) {
    return true;
  }
  
  // Check WebP (RIFF container with WEBP format)
  if (bytes.length >= 12 && 
      bytes[0] === IMAGE_SIGNATURES.webp[0] &&
      bytes[1] === IMAGE_SIGNATURES.webp[1] &&
      bytes[2] === IMAGE_SIGNATURES.webp[2] &&
      bytes[3] === IMAGE_SIGNATURES.webp[3] &&
      bytes[8] === 0x57 && // W
      bytes[9] === 0x45 && // E
      bytes[10] === 0x42 && // B
      bytes[11] === 0x50) { // P
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  // Intake is closed - return 410 Gone
  return NextResponse.json(
    { error: 'Sponsor intake is currently closed. Please use the request form at /advertise/request.' },
    { status: 410 }
  );
  
  /* INTAKE FORM CODE - DISABLED WHILE IN REQUEST-ONLY MODE
  try {
    // Rate limit check (5 requests per IP per hour)
    const ip = getClientKey(request);
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

    // URL validation - only allow http and https schemes
    try {
      const toolUrlObj = new URL(toolUrl);
      const destUrlObj = new URL(destinationUrl);
      
      if (toolUrlObj.protocol !== 'http:' && toolUrlObj.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'Only http:// and https:// URLs are allowed.' },
          { status: 400 }
        );
      }
      
      if (destUrlObj.protocol !== 'http:' && destUrlObj.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'Only http:// and https:// URLs are allowed.' },
          { status: 400 }
        );
      }
      
      if (logoUrl) {
        const logoUrlObj = new URL(logoUrl);
        if (logoUrlObj.protocol !== 'http:' && logoUrlObj.protocol !== 'https:') {
          return NextResponse.json(
            { error: 'Only http:// and https:// URLs are allowed.' },
            { status: 400 }
          );
        }
      }
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

      // Read file content for validation
      const fileContent = await logoFile.arrayBuffer();
      
      // Validate file type by magic bytes - reject SVG, only allow PNG/JPG/WebP
      if (!validateImageMagicBytes(fileContent)) {
        return NextResponse.json(
          { error: 'Logo must be PNG, JPG, or WebP (SVG is not allowed).' },
          { status: 400 }
        );
      }

      try {
        const supabase = getServiceSupabase();
        const timestamp = Date.now();
        const safeName = toolName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Determine extension from magic bytes
        const bytes = new Uint8Array(fileContent);
        let ext = 'png';
        if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
          ext = 'jpg';
        } else if (bytes[0] === 0x52 && bytes[1] === 0x49) {
          ext = 'webp';
        }
        
        const fileName = `${safeName}-${timestamp}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('sponsor-assets')
          .upload(fileName, fileContent, {
            contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
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

    // Notification email via Resend (non-fatal). See lib/notify-email.ts for env vars
    // (RESEND_API_KEY, optional RESEND_FROM) and the logged error format.
    const contactEmail = getSiteContactEmail() ?? '';

    {
      const packageLabels: Record<string, string> = {
        'featured_tool': 'Featured Tool ($39)',
        'category_spotlight': 'Category Spotlight ($69)',
        'newsletter': 'Newsletter Sponsor ($29)',
        'founding_bundle': 'Founding Bundle ($99)',
      };

      // HTML-escape helper
      const escapeHtml = (text: string) => 
        text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

      await sendNotificationEmail({
        context: 'sponsor-intake',
        to: contactEmail,
        replyTo: email,
        subject: `Sponsor intake form: ${escapeHtml(toolName)} (${packageLabels[packageType]})`,
        html: `
          <h2>Sponsor Intake Form Submitted</h2>
          <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
          <p><strong>Contact:</strong> ${escapeHtml(contactName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Tool:</strong> ${escapeHtml(toolName)}</p>
          <p><strong>URL:</strong> <a href="${escapeHtml(toolUrl)}">${escapeHtml(toolUrl)}</a></p>
          <p><strong>Package:</strong> ${packageLabels[packageType]}</p>
          <p><strong>Preferred start:</strong> ${preferredStartDate}</p>
          ${categorySlug ? `<p><strong>Category:</strong> ${escapeHtml(categorySlug)}</p>` : ''}
          <p><strong>Blurb:</strong><br>${escapeHtml(blurb).replace(/\n/g, '<br>')}</p>
          <p><strong>Destination URL:</strong> <a href="${escapeHtml(destinationUrl)}">${escapeHtml(destinationUrl)}</a></p>
          ${logoUrl ? `<p><strong>Logo URL:</strong> ${escapeHtml(logoUrl)}</p>` : ''}
          ${logoFilePath ? `<p><strong>Logo file:</strong> ${escapeHtml(logoFilePath)}</p>` : ''}
          <hr>
          <p><small>Submitted at ${new Date().toISOString()}</small></p>
          <p><small>Review in admin: <a href="https://aionestop.shop/admin/sponsors">/admin/sponsors</a></small></p>
        `,
      });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Unexpected error in sponsor intake:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
  */
}
