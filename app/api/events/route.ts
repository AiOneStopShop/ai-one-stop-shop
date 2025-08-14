import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      session_id,
      visitor_id,
      event_type,
      event_name,
      page_url,
      page_title,
      element_id,
      element_class,
      element_text,
      custom_data
    } = body

    // Create event record
    const { data, error } = await supabase
      .from('visitor_events')
      .insert({
        session_id,
        visitor_id,
        event_type,
        event_name,
        page_url,
        page_title,
        element_id,
        element_class,
        element_text,
        custom_data
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Event tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track event',
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
    const visitor_id = searchParams.get('visitor_id')
    const event_type = searchParams.get('event_type')
    const page_url = searchParams.get('page_url')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('visitor_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (session_id) {
      query = query.eq('session_id', session_id)
    }

    if (visitor_id) {
      query = query.eq('visitor_id', visitor_id)
    }

    if (event_type) {
      query = query.eq('event_type', event_type)
    }

    if (page_url) {
      query = query.eq('page_url', page_url)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
