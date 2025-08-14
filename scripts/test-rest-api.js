#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID

console.log('🔍 Testing Airtable REST API\n')

console.log('📋 Configuration:')
console.log(`Personal Access Token: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4) : 'NOT FOUND'}`)
console.log(`Base ID: ${baseId || 'NOT FOUND'}`)
console.log('')

async function testRestAPI() {
  try {
    console.log('🔍 Testing REST API access...')
    
    // Test the REST API directly
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ SUCCESS! Found ${data.tables.length} table(s)`)
      
      data.tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.name} (ID: ${table.id})`)
      })
      
      // Try to access the AI Tools table
      const aiToolsTable = data.tables.find(table => table.name === 'AI Tools')
      if (aiToolsTable) {
        console.log(`\n🔍 Testing access to AI Tools table (${aiToolsTable.id})...`)
        
        const recordsResponse = await fetch(`https://api.airtable.com/v0/${baseId}/${aiToolsTable.id}?maxRecords=1`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json()
          console.log(`✅ Successfully accessed AI Tools table! Found ${recordsData.records.length} records`)
          
          if (recordsData.records.length > 0) {
            console.log('📝 Sample record fields:')
            const fields = Object.keys(recordsData.records[0].fields)
            fields.forEach(field => {
              console.log(`  - ${field}`)
            })
          }
        } else {
          console.log(`❌ Could not access AI Tools table: ${recordsResponse.status} ${recordsResponse.statusText}`)
        }
      } else {
        console.log('\n⚠️  AI Tools table not found in the base')
        console.log('   Available tables:')
        data.tables.forEach(table => {
          console.log(`   - ${table.name}`)
        })
      }
      
    } else {
      console.log(`❌ Error accessing base: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        console.log('\n🔧 This means:')
        console.log('1. The Personal Access Token is invalid')
        console.log('2. The PAT doesn\'t have the right scopes')
        console.log('3. The PAT doesn\'t have access to this base')
      } else if (response.status === 404) {
        console.log('\n🔧 This means:')
        console.log('1. The Base ID is incorrect')
        console.log('2. The base doesn\'t exist')
        console.log('3. You don\'t have access to this base')
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

testRestAPI().catch(console.error)
