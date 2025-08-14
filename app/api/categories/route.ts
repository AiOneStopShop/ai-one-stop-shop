import { NextResponse } from 'next/server'
import { supabaseUtils } from '@/lib/supabase'

export async function GET() {
  try {
    const categories = await supabaseUtils.getCategories()

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
