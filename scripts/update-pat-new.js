#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// The new Personal Access Token provided by the user
const newPAT = 'patppV1pZhK3XkIGL'

console.log('🔑 Updating Personal Access Token...\n')

// Read current .env.local
const envPath = path.join(process.cwd(), '.env.local')
let envContent = ''

try {
  envContent = fs.readFileSync(envPath, 'utf8')
  console.log('✅ Read .env.local file')
} catch (error) {
  console.log('❌ Could not read .env.local file:', error.message)
  process.exit(1)
}

// Replace the API key with the new PAT
const updatedContent = envContent.replace(
  /AIRTABLE_API_KEY=.*/,
  `AIRTABLE_API_KEY=${newPAT}`
)

try {
  fs.writeFileSync(envPath, updatedContent)
  console.log('✅ Updated Personal Access Token in .env.local')
  console.log(`📝 New PAT: ${newPAT.substring(0, 10)}...${newPAT.substring(newPAT.length - 4)}`)
} catch (error) {
  console.log('❌ Error updating .env.local:', error.message)
  process.exit(1)
}

console.log('\n🔍 Testing the new Personal Access Token...')

// Test the new configuration
try {
  const { execSync } = require('child_process')
  execSync('npm run test:pat-basic', { stdio: 'inherit' })
} catch (error) {
  console.log('❌ Test failed, but PAT has been updated')
}

console.log('\n🎉 Personal Access Token updated successfully!')
console.log('📋 Next steps:')
console.log('1. Test the connection: npm run test:airtable')
console.log('2. If successful, migrate your data: npm run migrate:airtable')
console.log('3. Test your site: npm run dev')
