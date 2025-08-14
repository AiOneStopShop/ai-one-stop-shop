#!/usr/bin/env node

const Airtable = require('airtable')
require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID
const tableId = 'tblDa14vnGIAsllvh' // Your AI Tools table ID

console.log('🔍 Testing Airtable with Table ID\n')

console.log('📋 Configuration:')
console.log(`Personal Access Token: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4) : 'NOT FOUND'}`)
console.log(`Base ID: ${baseId || 'NOT FOUND'}`)
console.log(`Table ID: ${tableId}`)
console.log('')

const airtable = new Airtable({ apiKey })
const base = airtable.base(baseId)

async function testTableAccess() {
  try {
    console.log('🔍 Testing access using table ID...')
    
    // Try to access the table using the table ID
    const records = await base(tableId).select({ maxRecords: 1 }).all()
    console.log(`✅ SUCCESS! Found ${records.length} records using table ID`)
    
    if (records.length > 0) {
      console.log('📝 Sample record fields:')
      const fields = Object.keys(records[0].fields)
      fields.forEach(field => {
        console.log(`  - ${field}`)
      })
    }
    
    console.log('\n🎉 Table access working! Ready to migrate data.')
    
  } catch (error) {
    console.log('❌ Error accessing table with ID:', error.message)
    
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check if the Personal Access Token has the right scopes')
    console.log('2. Make sure the table ID is correct')
    console.log('3. Verify the base ID is correct')
    console.log('4. Check if the table exists in your base')
    
    console.log('\n💡 Required PAT scopes:')
    console.log('- data.records:read')
    console.log('- data.records:write')
    console.log('- schema.bases:read')
  }
}

testTableAccess().catch(console.error)
