#!/usr/bin/env node

const Airtable = require('airtable')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID

if (!apiKey || !baseId) {
  console.log('❌ Missing Airtable credentials!')
  console.log('Run: npm run setup:airtable')
  process.exit(1)
}

const airtable = new Airtable({ apiKey })
const base = airtable.base(baseId)

// Import the existing tools data
const aiTools = require('../data/aiTools').aiTools

async function migrateTools() {
  console.log('🚀 Migrating AI Tools to Airtable...\n')
  
  try {
    // Check if table exists and has records
    const existingRecords = await base('AI Tools').select({ maxRecords: 1 }).all()
    
    if (existingRecords.length > 0) {
      console.log('⚠️  AI Tools table already has data!')
      console.log('   Skipping migration to avoid duplicates.')
      console.log('   If you want to replace existing data, clear the table first.')
      return
    }

    console.log(`📊 Found ${aiTools.length} tools to migrate`)
    
    // Prepare data for Airtable
    const records = aiTools.map(tool => ({
      fields: {
        Name: tool.name,
        Description: tool.description,
        Category: [tool.category],
        Subcategory: [tool.subcategory],
        Rating: tool.rating,
        Price: tool.price,
        PriceRange: tool.priceRange,
        Features: tool.features,
        Tags: tool.tags,
        Image: tool.image,
        AffiliateLink: tool.affiliateLink,
        Popularity: tool.popularity,
        Difficulty: tool.difficulty,
        UseCase: tool.useCase,
        AgentType: tool.agentType || '',
        Capabilities: tool.capabilities || [],
        Integrations: tool.integrations || [],
        PricingModel: tool.pricingModel || '',
        Status: 'active',
        LastUpdated: new Date().toISOString()
      }
    }))

    // Create records in batches (Airtable has limits)
    const batchSize = 10
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      try {
        const createdRecords = await base('AI Tools').create(batch)
        successCount += createdRecords.length
        console.log(`✅ Migrated batch ${Math.floor(i / batchSize) + 1}: ${createdRecords.length} tools`)
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
    console.log('1. Make sure your Airtable base has an "AI Tools" table')
    console.log('2. Check that the table has the correct field names')
    console.log('3. Verify your API key has write permissions')
  }
}

async function createSampleData() {
  console.log('\n📝 Creating sample categories...')
  
  const categories = [
    { Name: 'AI Assistant', Description: 'AI-powered assistants and chatbots', Icon: 'ChatBubbleLeftRightIcon', Color: 'brand-purple', SortOrder: 1 },
    { Name: 'Image Generation', Description: 'AI tools for creating and editing images', Icon: 'PhotoIcon', Color: 'brand-blue', SortOrder: 2 },
    { Name: 'Video Creation', Description: 'AI tools for video generation and editing', Icon: 'VideoCameraIcon', Color: 'brand-orange', SortOrder: 3 },
    { Name: 'Text & Writing', Description: 'AI tools for writing and text processing', Icon: 'DocumentTextIcon', Color: 'accent-500', SortOrder: 4 },
    { Name: 'Code & Development', Description: 'AI tools for coding and development', Icon: 'CodeBracketIcon', Color: 'brand-purple', SortOrder: 5 },
    { Name: 'Audio & Music', Description: 'AI tools for audio and music generation', Icon: 'MusicalNoteIcon', Color: 'brand-blue', SortOrder: 6 },
    { Name: 'Data & Analytics', Description: 'AI tools for data analysis and visualization', Icon: 'ChartBarIcon', Color: 'brand-orange', SortOrder: 7 },
    { Name: 'Productivity', Description: 'AI tools for productivity and workflow', Icon: 'ClockIcon', Color: 'accent-500', SortOrder: 8 }
  ]

  try {
    await base('Categories').create(categories.map(cat => ({ fields: cat })))
    console.log('✅ Created sample categories')
  } catch (error) {
    console.log('⚠️  Could not create categories (table might not exist):', error.message)
  }

  console.log('\n📝 Creating sample personas...')
  
  const personas = [
    {
      Name: 'Tech-Savvy Sarah',
      Description: 'Early adopter who loves cutting-edge AI innovations',
      PrimaryInterest: 'Latest AI innovations and cutting-edge tools',
      ShoppingBehavior: 'Researches thoroughly, compares features',
      KeyNeeds: ['Advanced functionality', 'Integration capabilities'],
      Budget: 'High',
      PainPoints: ['Needs tools that can keep up with rapid tech changes'],
      Icon: 'RocketLaunchIcon',
      Color: 'from-brand-purple to-brand-blue'
    },
    {
      Name: 'Startup Steve',
      Description: 'Entrepreneur focused on scalable AI solutions',
      PrimaryInterest: 'Scalable AI solutions for growing business',
      ShoppingBehavior: 'ROI-focused, looks for bundle deals',
      KeyNeeds: ['Cost-effective tools', 'Scalable solutions'],
      Budget: 'Medium',
      PainPoints: ['Finding affordable tools with enterprise features'],
      Icon: 'BuildingOfficeIcon',
      Color: 'from-brand-blue to-accent-500'
    },
    {
      Name: 'Corporate Claire',
      Description: 'Enterprise professional requiring secure AI solutions',
      PrimaryInterest: 'Enterprise-grade AI solutions with security features',
      ShoppingBehavior: 'Thorough vetting process, requires documentation',
      KeyNeeds: ['Compliance', 'Security', 'Team collaboration'],
      Budget: 'High',
      PainPoints: ['Finding tools that meet corporate security standards'],
      Icon: 'ShieldCheckIcon',
      Color: 'from-brand-orange to-accent-500'
    },
    {
      Name: 'Freelance Fred',
      Description: 'Independent professional seeking productivity tools',
      PrimaryInterest: 'AI tools that improve productivity and creativity',
      ShoppingBehavior: 'Values free trials and flexible pricing',
      KeyNeeds: ['User-friendly interfaces', 'Quick implementation'],
      Budget: 'Low',
      PainPoints: ['Finding affordable tools without technical expertise'],
      Icon: 'UserIcon',
      Color: 'from-accent-500 to-brand-purple'
    }
  ]

  try {
    await base('User Personas').create(personas.map(persona => ({ fields: persona })))
    console.log('✅ Created sample personas')
  } catch (error) {
    console.log('⚠️  Could not create personas (table might not exist):', error.message)
  }
}

async function main() {
  try {
    await migrateTools()
    await createSampleData()
    
    console.log('\n🎉 Setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Visit your Airtable base to review the data')
    console.log('2. Run: npm run dev')
    console.log('3. Visit http://localhost:3001 to see your site')
    console.log('4. Test the API endpoints: http://localhost:3001/api/tools')
    
  } catch (error) {
    console.log('❌ Setup failed:', error.message)
  }
}

main()
