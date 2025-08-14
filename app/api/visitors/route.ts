import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      session_id,
      ip_address,
      user_agent,
      referrer,
      landing_page,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      country,
      city,
      region,
      timezone,
      device_type,
      browser,
      os,
      screen_resolution,
      language
    } = body

    // Check if visitor already exists
    const { data: existingVisitor } = await supabase
      .from('visitors')
      .select('*')
      .eq('session_id', session_id)
      .single()

    if (existingVisitor) {
      // Update existing visitor
      const { data, error } = await supabase
        .from('visitors')
        .update({
          last_visit_at: new Date().toISOString(),
          visit_count: existingVisitor.visit_count + 1,
          pages_viewed: existingVisitor.pages_viewed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', session_id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        isNewVisitor: false
      })
    } else {
      // Create new visitor
      const { data, error } = await supabase
        .from('visitors')
        .insert({
          session_id,
          ip_address,
          user_agent,
          referrer,
          landing_page,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          country,
          city,
          region,
          timezone,
          device_type,
          browser,
          os,
          screen_resolution,
          language
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        isNewVisitor: true
      })
    }
  } catch (error) {
    console.error('Error tracking visitor:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track visitor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (session_id) {
      query = query.eq('session_id', session_id)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Error fetching visitors:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch visitors',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
