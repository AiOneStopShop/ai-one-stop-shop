#!/usr/bin/env node

const Airtable = require('airtable')
require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID

console.log('🔍 Basic Personal Access Token Test\n')

console.log('📋 Configuration:')
console.log(`Personal Access Token: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4) : 'NOT FOUND'}`)
console.log(`Base ID: ${baseId || 'NOT FOUND'}`)
console.log('')

if (!apiKey || !baseId) {
  console.log('❌ Missing configuration')
  process.exit(1)
}

const airtable = new Airtable({ apiKey })
const base = airtable.base(baseId)

async function testBasicAccess() {
  try {
    console.log('🔍 Testing basic base access...')
    
    // Try to access a table directly (let's try common table names)
    const commonTableNames = ['AI Tools', 'Tools', 'Table 1', 'Sheet1']
    
    for (const tableName of commonTableNames) {
      try {
        console.log(`📋 Testing table: "${tableName}"`)
        const records = await base(tableName).select({ maxRecords: 1 }).all()
        console.log(`✅ SUCCESS! Found ${records.length} records in "${tableName}"`)
        
        if (records.length > 0) {
          console.log('📝 Sample record fields:')
          const fields = Object.keys(records[0].fields)
          fields.forEach(field => {
            console.log(`  - ${field}`)
          })
        }
        
        return // Success, exit the function
      } catch (tableError) {
        console.log(`❌ Could not access "${tableName}": ${tableError.message}`)
      }
    }
    
    console.log('\n❌ Could not access any tables')
    console.log('\n🔧 This suggests:')
    console.log('1. The Personal Access Token might be invalid')
    console.log('2. The PAT doesn\'t have the right scopes')
    console.log('3. The PAT doesn\'t have access to this base')
    console.log('4. The table names don\'t match')
    
  } catch (error) {
    console.log('❌ Error:', error.message)
    
    if (error.message.includes('You should provide valid api key')) {
      console.log('\n🔧 This means:')
      console.log('1. The Personal Access Token is invalid')
      console.log('2. The PAT doesn\'t have the right scopes')
      console.log('3. The PAT doesn\'t have access to this base')
      
      console.log('\n💡 Solutions:')
      console.log('1. Generate a new Personal Access Token')
      console.log('2. Make sure the PAT has these scopes:')
      console.log('   - data.records:read')
      console.log('   - data.records:write')
      console.log('   - schema.bases:read')
      console.log('3. Make sure the PAT has access to this specific base')
    }
  }
}

testBasicAccess().catch(console.error)
