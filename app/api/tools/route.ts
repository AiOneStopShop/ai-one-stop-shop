import { NextRequest, NextResponse } from 'next/server'
import { supabaseUtils, convertSupabaseToolToTool } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const persona = searchParams.get('persona')
    const featured = searchParams.get('featured')

    let tools

    if (featured === 'true') {
      // Get featured tools
      const supabaseTools = await supabaseUtils.getFeaturedTools()
      tools = supabaseTools.map(convertSupabaseToolToTool)
    } else if (category) {
      // Get tools by category
      const supabaseTools = await supabaseUtils.getToolsByCategory(category)
      tools = supabaseTools.map(convertSupabaseToolToTool)
    } else if (search) {
      // Search tools
      const supabaseTools = await supabaseUtils.searchTools(search)
      tools = supabaseTools.map(convertSupabaseToolToTool)
    } else if (persona) {
      // Get tools by persona
      const supabaseTools = await supabaseUtils.getToolsByPersona(persona)
      tools = supabaseTools.map(convertSupabaseToolToTool)
    } else {
      // Get all tools
      const supabaseTools = await supabaseUtils.getAllTools()
      tools = supabaseTools.map(convertSupabaseToolToTool)
    }

    return NextResponse.json({
      success: true,
      data: tools,
      count: tools.length
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tools',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Convert to Supabase format
    const supabaseData = {
      name: body.name,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory,
      rating: body.rating || 0,
      price: body.price || 'Free',
      price_range: body.priceRange || 'free',
      features: body.features || [],
      tags: body.tags || [],
      image: body.image || '',
      affiliate_link: body.affiliateLink || '',
      popularity: body.popularity || 0,
      difficulty: body.difficulty || 'intermediate',
      use_case: body.useCase || [],
      agent_type: body.agentType,
      capabilities: body.capabilities,
      integrations: body.integrations,
      pricing_model: body.pricingModel,
      status: 'active' as const
    }
    
    // Add new tool to Supabase
    const newTool = await supabaseUtils.addTool(supabaseData)
    
    return NextResponse.json({
      success: true,
      data: convertSupabaseToolToTool(newTool)
    })
  } catch (error) {
    console.error('Error adding tool:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add tool',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
