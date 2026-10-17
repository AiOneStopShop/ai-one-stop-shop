#!/usr/bin/env node
/**
 * Prebuild check: validates that NEXT_PUBLIC_AFFILIATE_LIVE flag matches database state.
 * Fails only when both DB env vars are present and a mismatch is found.
 * Skips with a warning when DB is unreachable.
 */

import { createClient } from '@supabase/supabase-js';

const affiliateLiveFlag = process.env.NEXT_PUBLIC_AFFILIATE_LIVE === 'true';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`\n🔍 Checking affiliate flag consistency...`);
console.log(`   NEXT_PUBLIC_AFFILIATE_LIVE=${affiliateLiveFlag}`);

if (!supabaseUrl || !supabaseKey) {
  console.log(`⚠️  Skipping check: SUPABASE credentials not available`);
  process.exit(0);
}

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Query using is_active (not active) with 10s timeout
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Database query timed out after 10s')), 10000)
  );
  
  const queryPromise = supabase
    .from('affiliate_links')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  
  const { count, error } = await Promise.race([queryPromise, timeoutPromise]);
  
  if (error) {
    console.log(`⚠️  Warning: Could not query affiliate_links (${error.message})`);
    console.log(`   Proceeding with build...`);
    process.exit(0);
  }
  
  const hasAffiliateData = (count || 0) > 0;
  
  if (affiliateLiveFlag !== hasAffiliateData) {
    const message = affiliateLiveFlag
      ? `❌ FATAL: NEXT_PUBLIC_AFFILIATE_LIVE=true but no active affiliate_links rows exist in the database.\n   Either add affiliate data or set the flag to false.`
      : `❌ FATAL: NEXT_PUBLIC_AFFILIATE_LIVE=false but ${count} active affiliate_links row(s) exist in the database.\n   Either remove affiliate data or set the flag to true.`;
    
    console.error('\n' + '='.repeat(80));
    console.error(message);
    console.error('='.repeat(80) + '\n');
    
    process.exit(1);
  }
  
  console.log(`✅ Affiliate flag check passed: flag=${affiliateLiveFlag}, active rows=${count || 0}\n`);
  process.exit(0);
  
} catch (err) {
  console.log(`⚠️  Warning: Could not validate affiliate flag consistency`);
  console.log(`   Error: ${err.message}`);
  console.log(`   Proceeding with build...\n`);
  process.exit(0);
}
