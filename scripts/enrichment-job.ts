// Scheduled enrichment job
// - Verify links still work
// - Check if pricing has changed (scrape pricing pages)
// - Mark stale entries for review
// - Works without AI API key (basic version)
// - Optional AI enrichment if OPENAI_API_KEY is set

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Check if a URL is still accessible
async function verifyLink(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.ok;
  } catch {
    return false;
  }
}

// Basic enrichment (no AI required)
async function enrichWithoutAI() {
  console.log('Running basic enrichment (no AI)...');
  
  const { data: tools } = await supabase
    .from('tools')
    .select('id, slug, name, website_url, last_verified_at')
    .eq('status', 'published');

  if (!tools) return;

  let verified = 0;
  let broken = 0;

  for (const tool of tools) {
    console.log(`Checking ${tool.name}...`);
    
    const isLive = await verifyLink(tool.website_url);
    
    if (isLive) {
      // Update last_verified_at
      await supabase
        .from('tools')
        .update({ last_verified_at: new Date().toISOString() })
        .eq('id', tool.id);
      verified++;
    } else {
      console.warn(`⚠️ ${tool.name} website is not accessible`);
      broken++;
      // TODO: Mark for review or send notification
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✓ Verified ${verified} tools`);
  if (broken > 0) {
    console.log(`⚠️ ${broken} tools need review`);
  }
}

// AI-powered enrichment (optional)
async function enrichWithAI() {
  console.log('Running AI enrichment...');
  
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.log('No OPENAI_API_KEY found, skipping AI enrichment');
    return;
  }

  // TODO: Use AI to:
  // - Generate better descriptions
  // - Extract pricing from pages
  // - Categorize tools
  // - Generate editorial_why text
}

async function main() {
  console.log('Starting enrichment job...\n');
  
  try {
    await enrichWithoutAI();
    await enrichWithAI();
    
    console.log('\n✅ Enrichment completed');
  } catch (error) {
    console.error('Enrichment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { enrichWithoutAI, enrichWithAI };
