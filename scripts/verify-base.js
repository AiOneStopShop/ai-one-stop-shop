#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID

console.log('🔍 Verifying Airtable Base\n')

console.log('📋 Configuration:')
console.log(`Personal Access Token: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4) : 'NOT FOUND'}`)
console.log(`Base ID: ${baseId || 'NOT FOUND'}`)
console.log('')

async function verifyBase() {
  try {
    console.log('🔍 Testing base access...')
    
    // First, let's try to list all bases the PAT has access to
    console.log('📋 Checking what bases this PAT can access...')
    
    const response = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ SUCCESS! PAT can access ${data.bases.length} base(s)`)
      
      data.bases.forEach((base, index) => {
        console.log(`  ${index + 1}. ${base.name} (ID: ${base.id})`)
      })
      
      // Check if our target base is in the list
      const targetBase = data.bases.find(base => base.id === baseId)
      if (targetBase) {
        console.log(`\n✅ Found target base: ${targetBase.name}`)
        console.log(`📝 Base ID: ${targetBase.id}`)
        
        // Now try to access the tables in this specific base
        console.log('\n🔍 Testing table access in target base...')
        
        const tablesResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json()
          console.log(`✅ SUCCESS! Found ${tablesData.tables.length} table(s) in base`)
          
          tablesData.tables.forEach((table, index) => {
            console.log(`  ${index + 1}. ${table.name} (ID: ${table.id})`)
          })
          
          // Check for AI Tools table
          const aiToolsTable = tablesData.tables.find(table => table.name === 'AI Tools')
          if (aiToolsTable) {
            console.log(`\n🎉 AI Tools table found! (ID: ${aiToolsTable.id})`)
            console.log('✅ Ready to migrate data!')
          } else {
            console.log('\n⚠️  AI Tools table not found')
            console.log('   You need to create the AI Tools table in your base')
          }
          
        } else {
          console.log(`❌ Could not access tables: ${tablesResponse.status} ${tablesResponse.statusText}`)
        }
        
      } else {
        console.log(`\n❌ Target base ${baseId} not found in accessible bases`)
        console.log('   This means the PAT doesn\'t have access to this base')
      }
      
    } else {
      console.log(`❌ Error accessing bases: ${response.status} ${response.statusText}`)
      
      if (response.status === 401) {
        console.log('\n🔧 This means:')
        console.log('1. The Personal Access Token is invalid')
        console.log('2. The PAT doesn\'t have the right scopes')
        console.log('3. The PAT might be expired')
        
        console.log('\n💡 Required scopes:')
        console.log('- schema.bases:read')
        console.log('- data.records:read')
        console.log('- data.records:write')
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

verifyBase().catch(console.error)
