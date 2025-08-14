#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// The correct Base ID extracted from the URL
const correctBaseId = 'appv7IBZvNJ7Y3pmV'

console.log('🔧 Updating Base ID...\n')

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

// Replace the Base ID
const updatedContent = envContent.replace(
  /AIRTABLE_BASE_ID=.*/,
  `AIRTABLE_BASE_ID=${correctBaseId}`
)

try {
  fs.writeFileSync(envPath, updatedContent)
  console.log('✅ Updated Base ID in .env.local')
  console.log(`📝 New Base ID: ${correctBaseId}`)
} catch (error) {
  console.log('❌ Error updating .env.local:', error.message)
  process.exit(1)
}

console.log('\n🔍 Testing the new configuration...')

// Test the new configuration
try {
  const { execSync } = require('child_process')
  execSync('npm run test:airtable', { stdio: 'inherit' })
} catch (error) {
  console.log('❌ Test failed, but Base ID has been updated')
}

console.log('\n🎉 Base ID updated successfully!')
console.log('📋 Next steps:')
console.log('1. Create the AI Tools table in your Airtable base')
console.log('2. Run: npm run migrate:airtable')
console.log('3. Test your site: npm run dev')
