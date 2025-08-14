#!/usr/bin/env node

const Airtable = require('airtable')
require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID

console.log('🔍 Airtable Debug Test\n')

console.log('📋 Configuration:')
console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4) : 'NOT FOUND'}`)
console.log(`Base ID: ${baseId || 'NOT FOUND'}`)
console.log(`API Key length: ${apiKey ? apiKey.length : 0}`)
console.log(`API Key starts with: ${apiKey ? apiKey.substring(0, 3) : 'N/A'}`)
console.log('')

// Test different API key formats
const testKeys = [
  apiKey,
  apiKey?.startsWith('pat') ? apiKey : `pat${apiKey}`,
  apiKey?.startsWith('key') ? apiKey : `key${apiKey}`,
  apiKey?.replace('pat', 'key'),
  apiKey?.replace('key', 'pat')
].filter(Boolean)

async function testApiKeys() {
  console.log('🔍 Testing different API key formats...')

  for (let i = 0; i < testKeys.length; i++) {
    const testKey = testKeys[i]
    console.log(`\n📝 Test ${i + 1}: ${testKey.substring(0, 10)}...${testKey.substring(testKey.length - 4)}`)
    
    try {
      const airtable = new Airtable({ apiKey: testKey })
      const base = airtable.base(baseId)
      
      // Try to access the base
      const records = await base('AI Tools').select({ maxRecords: 1 }).all()
      console.log(`✅ SUCCESS! Found ${records.length} records`)
      console.log(`🎉 Working API Key: ${testKey.substring(0, 10)}...${testKey.substring(testKey.length - 4)}`)
      
      // Update the .env.local file with the working key
      const fs = require('fs')
      const envPath = require('path').join(process.cwd(), '.env.local')
      let envContent = fs.readFileSync(envPath, 'utf8')
      envContent = envContent.replace(
        /AIRTABLE_API_KEY=.*/,
        `AIRTABLE_API_KEY=${testKey}`
      )
      fs.writeFileSync(envPath, envContent)
      console.log('✅ Updated .env.local with working API key')
      
      return
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`)
    }
  }

  console.log('\n❌ All API key formats failed')
  console.log('\n🔧 Troubleshooting tips:')
  console.log('1. Check your API key at: https://airtable.com/account')
  console.log('2. Make sure you have the right permissions')
  console.log('3. Try generating a new API key')
  console.log('4. Check if your account has API access enabled')
}

testApiKeys().catch(console.error)
