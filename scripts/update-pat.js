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

async function updatePAT() {
  console.log('🔑 Update Airtable Personal Access Token\n')
  
  console.log('📋 Current issue:')
  console.log('Airtable now uses Personal Access Tokens (PATs) instead of API keys.')
  console.log('Let\'s update your configuration.\n')
  
  console.log('💡 To get your Personal Access Token:')
  console.log('1. Go to: https://airtable.com/account')
  console.log('2. Scroll down to "Personal access tokens" section')
  console.log('3. Click "Create new token"')
  console.log('4. Give it a name (e.g., "AI One Stop Shop")')
  console.log('5. Set scopes: "data.records:read" and "data.records:write"')
  console.log('6. Copy the token (should start with "pat")\n')
  
  const personalAccessToken = await question('Enter your Personal Access Token: ')
  
  if (!personalAccessToken || !personalAccessToken.startsWith('pat')) {
    console.log('❌ Personal Access Token must start with "pat"')
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
  
  // Replace the API key with Personal Access Token
  const updatedContent = envContent.replace(
    /AIRTABLE_API_KEY=.*/,
    `AIRTABLE_API_KEY=${personalAccessToken}`
  )
  
  try {
    fs.writeFileSync(envPath, updatedContent)
    console.log('✅ Updated Personal Access Token in .env.local')
    console.log(`📝 New PAT: ${personalAccessToken.substring(0, 10)}...${personalAccessToken.substring(personalAccessToken.length - 4)}`)
  } catch (error) {
    console.log('❌ Error updating .env.local:', error.message)
    rl.close()
    return
  }
  
  console.log('\n🔍 Testing the new Personal Access Token...')
  
  // Test the new configuration
  try {
    const { execSync } = require('child_process')
    execSync('npm run test:airtable', { stdio: 'inherit' })
  } catch (error) {
    console.log('❌ Test failed, but PAT has been updated')
  }
  
  rl.close()
}

updatePAT().catch(console.error)
