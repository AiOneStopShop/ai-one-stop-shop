#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupAirtable() {
  console.log('🚀 AI One Stop Shop - Airtable Setup\n')
  console.log('This script will help you configure your Airtable integration.\n')

  // Get API Key
  const apiKey = await question('Enter your Airtable API Key: ')
  if (!apiKey) {
    console.log('❌ API Key is required!')
    rl.close()
    return
  }

  // Get Base ID
  const baseId = await question('Enter your Airtable Base ID: ')
  if (!baseId) {
    console.log('❌ Base ID is required!')
    rl.close()
    return
  }

  // Create .env.local file
  const envContent = `# Airtable Configuration
AIRTABLE_API_KEY=${apiKey}
AIRTABLE_BASE_ID=${baseId}

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=https://aionestop.shop

# Custom Key (if needed)
CUSTOM_KEY=your_custom_key_here
`

  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('\n✅ Environment variables saved to .env.local')
  } catch (error) {
    console.log('❌ Error saving .env.local:', error.message)
    rl.close()
    return
  }

  // Test the connection
  console.log('\n🔍 Testing Airtable connection...')
  
  try {
    const Airtable = require('airtable')
    const airtable = new Airtable({ apiKey })
    const base = airtable.base(baseId)
    
    // Try to fetch a record to test the connection
    const records = await base('AI Tools').select({ maxRecords: 1 }).all()
    
    if (records.length > 0) {
      console.log('✅ Successfully connected to Airtable!')
      console.log(`📊 Found ${records.length} record(s) in AI Tools table`)
    } else {
      console.log('⚠️  Connected to Airtable, but no records found in AI Tools table')
      console.log('   This is normal if you haven\'t added any tools yet.')
    }
  } catch (error) {
    console.log('❌ Error connecting to Airtable:', error.message)
    console.log('\n🔧 Troubleshooting tips:')
    console.log('1. Check your API key is correct')
    console.log('2. Verify your Base ID is correct')
    console.log('3. Make sure you have access to the base')
    console.log('4. Check that the "AI Tools" table exists')
  }

  console.log('\n📋 Next steps:')
  console.log('1. Follow the AIRTABLE_SETUP.md guide to create your tables')
  console.log('2. Add your AI tools data to Airtable')
  console.log('3. Test your integration with: npm run dev')
  console.log('4. Visit http://localhost:3001 to see your site')

  rl.close()
}

setupAirtable().catch(console.error)
