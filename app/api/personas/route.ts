import { NextResponse } from 'next/server'
import { supabaseUtils } from '@/lib/supabase'

export async function GET() {
  try {
    const personas = await supabaseUtils.getPersonas()

    return NextResponse.json({
      success: true,
      data: personas,
      count: personas.length
    })
  } catch (error) {
    console.error('Error fetching personas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch personas',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
