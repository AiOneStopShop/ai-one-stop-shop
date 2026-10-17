/**
 * AI Directory Import Pipeline
 * 
 * Fetches and parses AI tool directories from public sources:
 * - https://github.com/best-of-ai/ai-directories
 * - Other vendor lists
 * 
 * Saves as DRAFT records to Supabase (when env vars exist) or local JSON file
 * Never auto-publishes
 */

import * as fs from 'fs';
import * as path from 'path';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/best-of-ai/ai-directories/main/README.md';

interface DraftTool {
  name: string;
  description: string;
  url: string;
  source: string;
  status: 'draft';
  imported_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchAIDirectoriesREADME(): Promise<string> {
  console.log('Fetching AI Directories list from GitHub...');
  
  try {
    const response = await fetch(GITHUB_RAW_BASE);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch from GitHub:', error);
    return '';
  }
}

function parseDirectoryEntries(markdown: string): DraftTool[] {
  const tools: DraftTool[] = [];
  
  // Parse markdown list entries like: - [Name](url) - Description
  const lineRegex = /^\s*-\s*\[([^\]]+)\]\(([^)]+)\)\s*[–-]?\s*(.*)$/gm;
  
  let match;
  while ((match = lineRegex.exec(markdown)) !== null) {
    const [, name, url, description] = match;
    
    // Skip if it looks like a section header or non-tool entry
    if (!url.startsWith('http')) continue;
    
    tools.push({
      name: name.trim(),
      description: description.trim() || 'AI tool directory',
      url: url.trim(),
      source: 'best-of-ai/ai-directories',
      status: 'draft',
      imported_at: new Date().toISOString(),
    });
  }
  
  return tools;
}

async function saveToSupabase(tools: DraftTool[]): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase not configured, skipping database save');
    return false;
  }
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const records = tools.map(tool => ({
      slug: slugify(tool.name),
      name: tool.name,
      tagline: tool.description,
      description: tool.description,
      website_url: tool.url,
      source_url: tool.url,
      pricing_summary: 'Contact for pricing',
      pricing_model: 'contact',
      has_free_tier: false,
      platforms: ['Web'],
      features: [],
      editorial_score: 0,
      is_sponsored: false,
      status: 'draft',
      import_source: tool.source,
      last_verified_at: null,
    }));
    
    const { data, error } = await supabase
      .from('tools')
      .insert(records)
      .select();
    
    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return false;
    }
    
    console.log(`✅ Saved ${data?.length || 0} draft tools to Supabase`);
    return true;
  } catch (error) {
    console.error('❌ Supabase save error:', error);
    return false;
  }
}

function saveToLocalJSON(tools: DraftTool[]): void {
  const outputPath = path.join(process.cwd(), 'draft-tools.json');
  
  let existing: DraftTool[] = [];
  if (fs.existsSync(outputPath)) {
    existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
  }
  
  // Merge with existing, avoiding duplicates by URL
  const urlSet = new Set(existing.map(t => t.url));
  const newTools = tools.filter(t => !urlSet.has(t.url));
  
  const combined = [...existing, ...newTools];
  
  fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2));
  console.log(`✅ Saved ${newTools.length} new draft tools to ${outputPath}`);
  console.log(`   Total drafts: ${combined.length}`);
}

async function main() {
  console.log('🚀 Starting AI Directory Import Pipeline\n');
  
  const readme = await fetchAIDirectoriesREADME();
  
  if (!readme) {
    console.error('❌ Failed to fetch directory data');
    process.exit(1);
  }
  
  const tools = parseDirectoryEntries(readme);
  console.log(`\n📊 Parsed ${tools.length} potential tools\n`);
  
  if (tools.length === 0) {
    console.log('⚠️  No tools found. Check the parsing logic or source format.');
    process.exit(0);
  }
  
  // Show sample
  console.log('Sample entries:');
  tools.slice(0, 3).forEach((tool, i) => {
    console.log(`  ${i + 1}. ${tool.name}`);
    console.log(`     ${tool.url}`);
  });
  console.log('');
  
  // Try Supabase first, fall back to local JSON
  const saved = await saveToSupabase(tools);
  
  if (!saved) {
    saveToLocalJSON(tools);
  }
  
  console.log('\n✅ Import pipeline complete');
  console.log('⚠️  NOTE: All imported tools are DRAFT status and require manual review before publishing');
}

main().catch(console.error);
