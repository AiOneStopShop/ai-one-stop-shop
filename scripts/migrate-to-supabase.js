#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
// Import AI tools data
const aiTools = [
  {
    id: 1,
    name: "Claude",
    description: "Anthropic's AI assistant for complex reasoning and analysis",
    category: "AI Assistant",
    subcategory: "Chatbots",
    rating: 4.8,
    price: "Free - $20/month",
    priceRange: "freemium",
    features: ["Advanced reasoning", "Code generation", "Document analysis", "Creative writing"],
    tags: ["AI assistant", "reasoning", "coding", "writing"],
    image: "/images/tools/claude.jpg",
    affiliateLink: "https://claude.ai",
    popularity: 95,
    difficulty: "intermediate",
    useCase: ["Content creation", "Code review", "Research", "Analysis"]
  },
  {
    id: 2,
    name: "ChatGPT",
    description: "OpenAI's conversational AI for various tasks",
    category: "AI Assistant",
    subcategory: "Chatbots",
    rating: 4.7,
    price: "Free - $20/month",
    priceRange: "freemium",
    features: ["Conversational AI", "Code generation", "Creative writing", "Problem solving"],
    tags: ["AI assistant", "chatbot", "writing", "coding"],
    image: "/images/tools/chatgpt.jpg",
    affiliateLink: "https://chat.openai.com",
    popularity: 98,
    difficulty: "beginner",
    useCase: ["Content creation", "Customer support", "Learning", "Brainstorming"]
  },
  {
    id: 3,
    name: "Firecrawl",
    description: "AI-powered web scraping and data extraction tool",
    category: "Data & Analytics",
    subcategory: "Web Scraping",
    rating: 4.5,
    price: "$49/month",
    priceRange: "paid",
    features: ["Web scraping", "Data extraction", "API integration", "Automation"],
    tags: ["web scraping", "data extraction", "automation"],
    image: "/images/tools/firecrawl.jpg",
    affiliateLink: "https://firecrawl.dev",
    popularity: 75,
    difficulty: "intermediate",
    useCase: ["Market research", "Data collection", "Competitor analysis"]
  },
  {
    id: 4,
    name: "Perplexity",
    description: "AI-powered search engine with real-time information",
    category: "AI Assistant",
    subcategory: "Search",
    rating: 4.6,
    price: "Free - $20/month",
    priceRange: "freemium",
    features: ["Real-time search", "Source citations", "Conversational interface", "Research tools"],
    tags: ["search", "research", "AI assistant"],
    image: "/images/tools/perplexity.jpg",
    affiliateLink: "https://perplexity.ai",
    popularity: 85,
    difficulty: "beginner",
    useCase: ["Research", "Information gathering", "Fact-checking"]
  }
]

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase environment variables')
  console.log('Please run: npm run setup:supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility functions
const supabaseUtils = {
  async getAllTools() {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .order('popularity', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async addTool(toolData) {
    const { data, error } = await supabase
      .from('ai_tools')
      .insert(toolData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  supabase
}

async function migrateToSupabase() {
  console.log('🚀 Migrating AI Tools to Supabase...\n')
  
  try {
    // Check if we have any existing tools
    console.log('🔍 Checking existing tools...')
    const existingTools = await supabaseUtils.getAllTools()
    
    if (existingTools.length > 0) {
      console.log(`⚠️  Found ${existingTools.length} existing tools in Supabase`)
      console.log('   Skipping migration to avoid duplicates.')
      console.log('   If you want to replace existing data, clear the table first.')
      return
    }

    console.log(`📊 Found ${aiTools.length} tools to migrate`)
    
    // Prepare data for Supabase
    const tools = aiTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      subcategory: tool.subcategory,
      rating: tool.rating,
      price: tool.price,
      price_range: tool.priceRange,
      features: tool.features,
      tags: tool.tags,
      image: tool.image,
      affiliate_link: tool.affiliateLink,
      popularity: tool.popularity,
      difficulty: tool.difficulty,
      use_case: tool.useCase,
      agent_type: tool.agentType || null,
      capabilities: tool.capabilities || [],
      integrations: tool.integrations || [],
      pricing_model: tool.pricingModel || null,
      status: 'active'
    }))

    // Insert tools in batches
    const batchSize = 10
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < tools.length; i += batchSize) {
      const batch = tools.slice(i, i + batchSize)
      
      try {
        for (const tool of batch) {
          await supabaseUtils.addTool(tool)
          successCount++
        }
        console.log(`✅ Migrated batch ${Math.floor(i / batchSize) + 1}: ${batch.length} tools`)
      } catch (error) {
        errorCount += batch.length
        console.log(`❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error.message)
      }
    }

    console.log(`\n🎉 Migration complete!`)
    console.log(`✅ Successfully migrated: ${successCount} tools`)
    if (errorCount > 0) {
      console.log(`❌ Failed to migrate: ${errorCount} tools`)
    }

  } catch (error) {
    console.log('❌ Migration failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure your Supabase project is set up')
    console.log('2. Check that the ai_tools table exists')
    console.log('3. Verify your environment variables are correct')
  }
}

async function createSampleData() {
  console.log('\n📝 Creating sample categories...')
  
  const categories = [
    { name: 'AI Assistant', description: 'AI-powered assistants and chatbots', icon: 'ChatBubbleLeftRightIcon', color: 'brand-purple', sort_order: 1 },
    { name: 'Image Generation', description: 'AI tools for creating and editing images', icon: 'PhotoIcon', color: 'brand-blue', sort_order: 2 },
    { name: 'Video Creation', description: 'AI tools for video generation and editing', icon: 'VideoCameraIcon', color: 'brand-orange', sort_order: 3 },
    { name: 'Text & Writing', description: 'AI tools for writing and text processing', icon: 'DocumentTextIcon', color: 'accent-500', sort_order: 4 },
    { name: 'Code & Development', description: 'AI tools for coding and development', icon: 'CodeBracketIcon', color: 'brand-purple', sort_order: 5 },
    { name: 'Audio & Music', description: 'AI tools for audio and music generation', icon: 'MusicalNoteIcon', color: 'brand-blue', sort_order: 6 },
    { name: 'Data & Analytics', description: 'AI tools for data analysis and visualization', icon: 'ChartBarIcon', color: 'brand-orange', sort_order: 7 },
    { name: 'Productivity', description: 'AI tools for productivity and workflow', icon: 'ClockIcon', color: 'accent-500', sort_order: 8 }
  ]

  try {
    for (const category of categories) {
      await supabaseUtils.supabase.from('categories').insert(category)
    }
    console.log('✅ Created sample categories')
  } catch (error) {
    console.log('⚠️  Could not create categories (table might not exist):', error.message)
  }

  console.log('\n📝 Creating sample personas...')
  
  const personas = [
    {
      name: 'Tech-Savvy Sarah',
      description: 'Early adopter who loves cutting-edge AI innovations',
      primary_interest: 'Latest AI innovations and cutting-edge tools',
      shopping_behavior: 'Researches thoroughly, compares features',
      key_needs: ['Advanced functionality', 'Integration capabilities'],
      budget: 'high',
      pain_points: ['Needs tools that can keep up with rapid tech changes'],
      icon: 'RocketLaunchIcon',
      color: 'from-brand-purple to-brand-blue'
    },
    {
      name: 'Startup Steve',
      description: 'Entrepreneur focused on scalable AI solutions',
      primary_interest: 'Scalable AI solutions for growing business',
      shopping_behavior: 'ROI-focused, looks for bundle deals',
      key_needs: ['Cost-effective tools', 'Scalable solutions'],
      budget: 'medium',
      pain_points: ['Finding affordable tools with enterprise features'],
      icon: 'BuildingOfficeIcon',
      color: 'from-brand-blue to-accent-500'
    },
    {
      name: 'Corporate Claire',
      description: 'Enterprise professional requiring secure AI solutions',
      primary_interest: 'Enterprise-grade AI solutions with security features',
      shopping_behavior: 'Thorough vetting process, requires documentation',
      key_needs: ['Compliance', 'Security', 'Team collaboration'],
      budget: 'high',
      pain_points: ['Finding tools that meet corporate security standards'],
      icon: 'ShieldCheckIcon',
      color: 'from-brand-orange to-accent-500'
    },
    {
      name: 'Freelance Fred',
      description: 'Independent professional seeking productivity tools',
      primary_interest: 'AI tools that improve productivity and creativity',
      shopping_behavior: 'Values free trials and flexible pricing',
      key_needs: ['User-friendly interfaces', 'Quick implementation'],
      budget: 'low',
      pain_points: ['Finding affordable tools without technical expertise'],
      icon: 'UserIcon',
      color: 'from-accent-500 to-brand-purple'
    }
  ]

  try {
    for (const persona of personas) {
      await supabaseUtils.supabase.from('personas').insert(persona)
    }
    console.log('✅ Created sample personas')
  } catch (error) {
    console.log('⚠️  Could not create personas (table might not exist):', error.message)
  }
}

async function main() {
  try {
    await migrateToSupabase()
    await createSampleData()
    
    console.log('\n🎉 Setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Visit your Supabase dashboard to review the data')
    console.log('2. Run: npm run dev')
    console.log('3. Visit http://localhost:3001 to see your site')
    console.log('4. Test the API endpoints: http://localhost:3001/api/tools')
    
  } catch (error) {
    console.log('❌ Setup failed:', error.message)
  }
}

main()
