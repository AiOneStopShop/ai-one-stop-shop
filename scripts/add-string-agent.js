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

// String.com Agent Data
const stringAgent = {
  name: "String.com",
  description: "AI agent platform for building, deploying, and managing custom AI agents with no-code tools",
  category: "AI Assistant",
  subcategory: "Agent Platform",
  rating: 4.6,
  price: "$29/month",
  price_range: "paid",
  features: [
    "No-code agent builder",
    "Custom agent creation",
    "Agent deployment",
    "Workflow automation",
    "API integration",
    "Agent marketplace",
    "Performance analytics",
    "Team collaboration",
    "Multi-agent orchestration",
    "Custom integrations"
  ],
  tags: [
    "agent platform",
    "no-code",
    "custom agents",
    "workflow automation",
    "deployment",
    "marketplace"
  ],
  image: "/images/tools/string.jpg",
  affiliate_link: "https://string.com",
  popularity: 88,
  difficulty: "beginner",
  use_case: [
    "Custom AI agent development",
    "Workflow automation",
    "Business process automation",
    "Agent deployment",
    "No-code AI solutions",
    "Team productivity"
  ],
  agent_type: "Agent Platform",
  capabilities: [
    "No-code agent building",
    "Custom agent creation",
    "Agent deployment",
    "Workflow automation",
    "API integration",
    "Multi-agent orchestration"
  ],
  integrations: [
    "Zapier",
    "Slack",
    "Discord",
    "Email platforms",
    "CRM systems",
    "Custom APIs",
    "Webhooks",
    "Database connections"
  ],
  pricing_model: "Subscription"
}

async function addStringAgent() {
  console.log('🤖 Adding String.com to your AI agents database...\n')
  
  try {
    // Check if String.com already exists
    const { data: existing } = await supabase
      .from('ai_tools')
      .select('id')
      .eq('name', 'String.com')
      .single()

    if (existing) {
      console.log('⚠️  String.com already exists in the database, skipping...')
      return
    }

    // Add String.com
    const { data, error } = await supabase
      .from('ai_tools')
      .insert(stringAgent)
      .select()
      .single()

    if (error) {
      console.log('❌ Error adding String.com:', error.message)
      return
    }

    console.log('✅ Successfully added String.com!')
    console.log(`📊 Tool ID: ${data.id}`)
    console.log(`🏷️  Category: ${data.category}`)
    console.log(`🤖 Agent Type: ${data.agent_type}`)
    console.log(`⭐ Rating: ${data.rating}`)
    console.log(`💰 Price: ${data.price}`)

    // Get updated total count
    const { data: allTools } = await supabase
      .from('ai_tools')
      .select('id')

    // Get agent count
    const { data: agents } = await supabase
      .from('ai_tools')
      .select('id')
      .not('agent_type', 'is', null)

    console.log(`\n📈 Total tools in database: ${allTools?.length || 0}`)
    console.log(`🤖 Total AI agents: ${agents?.length || 0}`)
    console.log('\n🎉 String.com is now available in your AI One Stop Shop!')

  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

addStringAgent()
