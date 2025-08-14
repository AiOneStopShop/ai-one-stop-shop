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

async function setupSupabase() {
  console.log('🚀 Supabase Setup for AI One Stop Shop\n')
  console.log('📋 You can find these values in your Supabase dashboard:')
  console.log('   Project URL: https://supabase.com/dashboard/project/jeukcomldafwrdrnadil')
  console.log('   Go to Settings > API\n')

  try {
    // Get Supabase URL
    const supabaseUrl = await question('Enter your Supabase Project URL (e.g., https://jeukcomldafwrdrnadil.supabase.co): ')
    
    // Get Supabase Anon Key
    const supabaseAnonKey = await question('Enter your Supabase Anon Public Key: ')

    // Read existing .env.local
    const envPath = path.join(__dirname, '..', '.env.local')
    let envContent = ''
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }

    // Remove existing Supabase variables
    envContent = envContent
      .split('\n')
      .filter(line => !line.startsWith('NEXT_PUBLIC_SUPABASE_'))
      .join('\n')

    // Add new Supabase variables
    const supabaseVars = [
      '',
      '# Supabase Configuration',
      `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}`,
      ''
    ].join('\n')

    // Write to .env.local
    fs.writeFileSync(envPath, envContent + supabaseVars)

    console.log('\n✅ Environment variables updated successfully!')
    console.log('📁 Updated: .env.local')
    console.log('\n🔧 Next steps:')
    console.log('1. Create database tables in Supabase')
    console.log('2. Run: npm run migrate:supabase')
    console.log('3. Run: npm run dev')
    console.log('4. Test your site at http://localhost:3001')

  } catch (error) {
    console.log('❌ Error setting up environment variables:', error.message)
  } finally {
    rl.close()
  }
}

setupSupabase()
