#!/usr/bin/env node

const Airtable = require('airtable')
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

async function createAIToolsTable() {
  console.log('🚀 Creating AI Tools Table in Airtable...\n')
  
  try {
    // First, check if the table already exists
    console.log('🔍 Checking if AI Tools table exists...')
    try {
      const records = await base('AI Tools').select({ maxRecords: 1 }).all()
      console.log('✅ AI Tools table already exists!')
      console.log(`📊 Found ${records.length} record(s)`)
      return
    } catch (error) {
      console.log('⚠️  AI Tools table not found, will create it...')
    }
    
    console.log('\n📋 Note: Airtable API cannot create tables programmatically.')
    console.log('   You need to create the table manually in the Airtable interface.')
    console.log('\n🔧 Follow these steps:')
    console.log('1. Go to: https://airtable.com/appv7IBZvNJ7Y3pmV')
    console.log('2. Click "Add a table" or the + button')
    console.log('3. Name it: "AI Tools"')
    console.log('4. Add the required fields (see AIRTABLE_TABLE_SETUP.md)')
    
    console.log('\n📋 Required Fields:')
    console.log('1. Name (Single line text)')
    console.log('2. Description (Long text)')
    console.log('3. Category (Multiple select)')
    console.log('4. Subcategory (Multiple select)')
    console.log('5. Rating (Number)')
    console.log('6. Price (Single line text)')
    console.log('7. PriceRange (Single select)')
    console.log('8. Features (Multiple select)')
    console.log('9. Tags (Multiple select)')
    console.log('10. Image (URL)')
    console.log('11. AffiliateLink (URL)')
    console.log('12. Popularity (Number)')
    console.log('13. Difficulty (Single select)')
    console.log('14. UseCase (Multiple select)')
    console.log('15. AgentType (Single line text)')
    console.log('16. Capabilities (Multiple select)')
    console.log('17. Integrations (Multiple select)')
    console.log('18. PricingModel (Single line text)')
    console.log('19. Status (Single select)')
    console.log('20. LastUpdated (Date)')
    
    console.log('\n💡 For detailed field options, see: AIRTABLE_TABLE_SETUP.md')
    
    console.log('\n⏳ After creating the table, run:')
    console.log('npm run test:airtable')
    console.log('npm run migrate:airtable')
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

async function addSampleRecord() {
  console.log('\n📝 Adding sample record to test the table...')
  
  try {
    const sampleRecord = {
      fields: {
        Name: 'Claude AI',
        Description: 'Advanced AI assistant for complex reasoning and analysis',
        Category: ['AI Assistant'],
        Subcategory: ['Chatbot'],
        Rating: 4.9,
        Price: '$20/month',
        PriceRange: 'paid',
        Features: ['Advanced reasoning', 'File analysis', 'Code generation', 'Research', 'Writing'],
        Tags: ['claude', 'anthropic', 'reasoning', 'analysis'],
        Image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
        AffiliateLink: 'https://claude.ai',
        Popularity: 95,
        Difficulty: 'intermediate',
        UseCase: ['Research', 'Writing', 'Analysis'],
        AgentType: 'Autonomous',
        Capabilities: ['Text processing', 'File analysis', 'Code generation'],
        Integrations: ['API', 'Web interface', 'Mobile app'],
        PricingModel: 'Subscription',
        Status: 'active',
        LastUpdated: new Date().toISOString()
      }
    }
    
    const record = await base('AI Tools').create([sampleRecord])
    console.log('✅ Sample record added successfully!')
    console.log(`📝 Record ID: ${record[0].id}`)
    
  } catch (error) {
    console.log('❌ Error adding sample record:', error.message)
    console.log('   Make sure the AI Tools table exists with the correct fields.')
  }
}

async function main() {
  await createAIToolsTable()
  
  // Ask if user wants to add a sample record
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.question('\n🤔 Would you like to add a sample record to test the table? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await addSampleRecord()
    }
    rl.close()
  })
}

main().catch(console.error)
