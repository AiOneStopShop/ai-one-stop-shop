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

async function updateApiKey() {
  console.log('🔑 Update Airtable API Key\n')
  
  console.log('📋 Current issue:')
  console.log('Your API key appears to be invalid or lacks permissions.')
  console.log('Let\'s generate a new one.\n')
  
  console.log('💡 To get a new API key:')
  console.log('1. Go to: https://airtable.com/account')
  console.log('2. Scroll down to "API" section')
  console.log('3. Click "Generate API key"')
  console.log('4. Copy the new key (should start with "pat")\n')
  
  const newApiKey = await question('Enter your new API key: ')
  
  if (!newApiKey || !newApiKey.startsWith('pat')) {
    console.log('❌ API key must start with "pat"')
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
  
  // Replace the API key
  const updatedContent = envContent.replace(
    /AIRTABLE_API_KEY=.*/,
    `AIRTABLE_API_KEY=${newApiKey}`
  )
  
  try {
    fs.writeFileSync(envPath, updatedContent)
    console.log('✅ Updated API key in .env.local')
    console.log(`📝 New API Key: ${newApiKey.substring(0, 10)}...${newApiKey.substring(newApiKey.length - 4)}`)
  } catch (error) {
    console.log('❌ Error updating .env.local:', error.message)
    rl.close()
    return
  }
  
  console.log('\n🔍 Testing the new API key...')
  
  // Test the new configuration
  try {
    const { execSync } = require('child_process')
    execSync('npm run test:airtable', { stdio: 'inherit' })
  } catch (error) {
    console.log('❌ Test failed, but API key has been updated')
  }
  
  rl.close()
}

updateApiKey().catch(console.error)
