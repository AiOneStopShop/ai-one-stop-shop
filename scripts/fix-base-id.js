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

async function fixBaseId() {
  console.log('🔧 Fix Airtable Base ID\n')
  
  console.log('📋 Current issue:')
  console.log('Your Base ID appears to be incorrect.')
  console.log('Base IDs should start with "app", not "pat".\n')
  
  console.log('💡 To find the correct Base ID:')
  console.log('1. Go to your Airtable base in your browser')
  console.log('2. Look at the URL: https://airtable.com/appXXXXXXXXXXXXXX/...')
  console.log('3. Copy the part after "/app" and before the next "/"\n')
  
  const newBaseId = await question('Enter the correct Base ID (should start with "app"): ')
  
  if (!newBaseId || !newBaseId.startsWith('app')) {
    console.log('❌ Base ID must start with "app"')
    rl.close()
    return
  }
  
  // Read current .env.local
  const envPath = path.join(process.cwd(), '.env.local')
  let envContent = ''
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8')
  } catch (error) {
    console.log('❌ Could not read .env.local file')
    rl.close()
    return
  }
  
  // Replace the Base ID
  const updatedContent = envContent.replace(
    /AIRTABLE_BASE_ID=.*/,
    `AIRTABLE_BASE_ID=${newBaseId}`
  )
  
  try {
    fs.writeFileSync(envPath, updatedContent)
    console.log('✅ Updated Base ID in .env.local')
    console.log(`📝 New Base ID: ${newBaseId}`)
  } catch (error) {
    console.log('❌ Error updating .env.local:', error.message)
    rl.close()
    return
  }
  
  console.log('\n🔍 Testing the new configuration...')
  
  // Test the new configuration
  try {
    const { execSync } = require('child_process')
    execSync('npm run test:airtable', { stdio: 'inherit' })
  } catch (error) {
    console.log('❌ Test failed, but Base ID has been updated')
  }
  
  rl.close()
}

fixBaseId().catch(console.error)
