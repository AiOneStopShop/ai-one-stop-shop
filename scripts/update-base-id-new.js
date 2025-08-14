#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// The new Base ID provided by the user
const newBaseId = 'appv7IBZvNJ7Y3pmV'

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
  `AIRTABLE_BASE_ID=${newBaseId}`
)

try {
  fs.writeFileSync(envPath, updatedContent)
  console.log('✅ Updated Base ID in .env.local')
  console.log(`📝 New Base ID: ${newBaseId}`)
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
console.log('1. Test the connection: npm run test:airtable')
console.log('2. If successful, migrate your data: npm run migrate:airtable')
console.log('3. Test your site: npm run dev')
