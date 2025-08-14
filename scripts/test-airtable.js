#!/usr/bin/env node

const Airtable = require('airtable')
require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID

console.log('🔍 Airtable Connection Test\n')

if (!apiKey) {
  console.log('❌ No API key found in .env.local')
  process.exit(1)
}

if (!baseId) {
  console.log('❌ No Base ID found in .env.local')
  process.exit(1)
}

console.log('📋 Current Configuration:')
console.log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`)
console.log(`Base ID: ${baseId}`)
console.log('')

const airtable = new Airtable({ apiKey })

async function testConnection() {
  try {
    console.log('🔍 Testing connection...')
    
    // Try to access the specific base directly
    console.log(`🔍 Testing access to base: ${baseId}`)
    const base = airtable.base(baseId)
    
    // Try to access the AI Tools table directly
    console.log('📋 Testing AI Tools table access...')
    try {
      const records = await base('AI Tools').select({ maxRecords: 1 }).all()
      console.log(`✅ Successfully connected to AI Tools table!`)
      console.log(`📊 Found ${records.length} record(s)`)
      
      if (records.length > 0) {
        console.log('📝 Sample record fields:')
        const fields = Object.keys(records[0].fields)
        fields.forEach(field => {
          console.log(`  - ${field}`)
        })
      }
    } catch (tableError) {
      console.log('⚠️  AI Tools table not found or not accessible')
      console.log(`   Error: ${tableError.message}`)
      
      console.log('\n💡 You need to create the AI Tools table:')
      console.log('1. Go to your Airtable base')
      console.log('2. Click "Add a table"')
      console.log('3. Name it "AI Tools"')
      console.log('4. Add the required fields (see AIRTABLE_SETUP.md)')
      
      // Try to test with a different table name
      console.log('\n🔍 Testing with different table names...')
      const testTables = ['Tools', 'AI_Tools', 'AITools', 'Tools List']
      
      for (const tableName of testTables) {
        try {
          const testRecords = await base(tableName).select({ maxRecords: 1 }).all()
          console.log(`✅ Found table: "${tableName}" with ${testRecords.length} records`)
          break
        } catch (e) {
          // Continue to next table name
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
    
    if (error.message.includes('Could not find what you are looking for')) {
      console.log('\n🔧 This usually means:')
      console.log('1. The Base ID is incorrect')
      console.log('2. You don\'t have access to this base')
      console.log('3. The base doesn\'t exist')
      
      console.log('\n💡 To find the correct Base ID:')
      console.log('1. Go to your Airtable base')
      console.log('2. Look at the URL: https://airtable.com/appXXXXXXXXXXXXXX/...')
      console.log('3. The Base ID is "appXXXXXXXXXXXXXX" (the part after /app)')
      console.log('4. Make sure you\'re using the correct Base ID format')
      console.log('5. The Base ID should start with "app" not "pat"')
    }
    
    if (error.message.includes('API key')) {
      console.log('\n🔧 API Key issue detected:')
      console.log('1. Check your API key is correct')
      console.log('2. Make sure you have the right permissions')
      console.log('3. Try generating a new API key')
    }
  }
}

testConnection()
