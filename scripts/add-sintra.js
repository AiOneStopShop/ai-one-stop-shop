#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sintra Tool Data
const sintraTool = {
  name: "Sintra",
  description: "AI-powered data analysis and visualization platform for business intelligence",
  category: "Data & Analytics",
  subcategory: "Business Intelligence",
  rating: 4.6,
  price: "$29/month",
  price_range: "paid",
  features: [
    "Natural language queries",
    "Data visualization",
    "Business intelligence",
    "SQL generation",
    "Interactive dashboards",
    "Data storytelling",
    "Real-time analytics",
    "Collaboration tools"
  ],
  tags: [
    "data analysis",
    "business intelligence",
    "visualization",
    "sql",
    "analytics",
    "dashboard",
    "nlp queries"
  ],
  image: "/images/tools/sintra.jpg",
  affiliate_link: "https://sintra.ai",
  popularity: 85,
  difficulty: "intermediate",
  use_case: [
    "Business intelligence",
    "Data analysis",
    "Reporting",
    "Dashboard creation",
    "Data storytelling",
    "Decision making",
    "Performance monitoring"
  ]
}

async function addSintra() {
  console.log('🚀 Adding Sintra to your AI tools database...\n')
  
  try {
    // Check if Sintra already exists
    const { data: existing } = await supabase
      .from('ai_tools')
      .select('id')
      .eq('name', 'Sintra')
      .single()

    if (existing) {
      console.log('⚠️  Sintra already exists in the database, skipping...')
      return
    }

    // Add Sintra
    const { data, error } = await supabase
      .from('ai_tools')
      .insert(sintraTool)
      .select()
      .single()

    if (error) {
      console.log('❌ Error adding Sintra:', error.message)
      return
    }

    console.log('✅ Successfully added Sintra!')
    console.log(`📊 Tool ID: ${data.id}`)
    console.log(`🏷️  Category: ${data.category}`)
    console.log(`⭐ Rating: ${data.rating}`)
    console.log(`💰 Price: ${data.price}`)

    // Get updated total count
    const { data: allTools } = await supabase
      .from('ai_tools')
      .select('id')

    console.log(`\n📈 Total tools in database: ${allTools?.length || 0}`)
    console.log('\n🎉 Sintra is now available in your AI One Stop Shop!')

  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

addSintra()
