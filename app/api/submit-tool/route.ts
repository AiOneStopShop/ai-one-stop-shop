import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolName, websiteUrl, contactEmail, description } = body;

    // Basic validation
    if (!toolName || !websiteUrl || !contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(websiteUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Insert into tool_submissions table
    const { error } = await supabase
      .from('tool_submissions')
      .insert({
        tool_name: toolName,
        website_url: websiteUrl,
        contact_email: contactEmail,
        description: description || null,
        status: 'pending',
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting tool:', error);
    return NextResponse.json(
      { error: 'Failed to submit tool' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
