import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      first_name,
      last_name,
      company,
      job_title,
      industry,
      interests,
      persona,
      budget_range,
      use_case,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      ip_address,
      country,
      city,
      region,
      timezone,
      device_type,
      browser,
      os,
      language
    } = body

    // Check if subscriber already exists
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single()

    if (existingSubscriber) {
      // Update existing subscriber
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          first_name: first_name || existingSubscriber.first_name,
          last_name: last_name || existingSubscriber.last_name,
          company: company || existingSubscriber.company,
          job_title: job_title || existingSubscriber.job_title,
          industry: industry || existingSubscriber.industry,
          interests: interests || existingSubscriber.interests,
          persona: persona || existingSubscriber.persona,
          budget_range: budget_range || existingSubscriber.budget_range,
          use_case: use_case || existingSubscriber.use_case,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        isNewSubscriber: false,
        message: 'Subscriber updated successfully'
      })
    } else {
      // Generate verification and unsubscribe tokens
      const verification_token = randomBytes(32).toString('hex')
      const unsubscribe_token = randomBytes(32).toString('hex')

      // Create new subscriber
      const { data, error } = await supabase
        .from('subscribers')
        .insert({
          email,
          first_name,
          last_name,
          company,
          job_title,
          industry,
          interests,
          persona,
          budget_range,
          use_case,
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          ip_address,
          country,
          city,
          region,
          timezone,
          device_type,
          browser,
          os,
          language,
          verification_token,
          verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          unsubscribe_token
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        isNewSubscriber: true,
        message: 'Subscriber created successfully'
      })
    }
  } catch (error) {
    console.error('Error managing subscriber:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to manage subscriber',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const persona = searchParams.get('persona')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (email) {
      query = query.eq('email', email)
    }

    if (status) {
      query = query.eq('subscription_status', status)
    }

    if (persona) {
      query = query.eq('persona', persona)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscribers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, action, token } = body

    if (action === 'verify') {
      // Verify email subscription
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          email_verified: true,
          verification_token: null,
          verification_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('verification_token', token)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        message: 'Email verified successfully'
      })
    } else if (action === 'unsubscribe') {
      // Unsubscribe from emails
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          subscription_status: 'unsubscribed',
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('unsubscribe_token', token)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        message: 'Unsubscribed successfully'
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action'
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating subscriber:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update subscriber',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
