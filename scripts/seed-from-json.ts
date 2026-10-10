// Seed script that reads from the actual JSON data files
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Starting database seed from JSON files...\n');

  try {
    // Read JSON files
    const toolsPath = path.join(process.cwd(), 'uploads', 'api-tools_2a75.json');
    const agentsPath = path.join(process.cwd(), 'uploads', 'api-agents_f655.json');

    if (!fs.existsSync(toolsPath)) {
      console.error('Tools JSON file not found at:', toolsPath);
      process.exit(1);
    }

    const toolsData = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
    const agentsData = fs.existsSync(agentsPath) 
      ? JSON.parse(fs.readFileSync(agentsPath, 'utf-8'))
      : [];

    console.log(`Found ${toolsData.length} tools and ${agentsData.length} agents in JSON files\n`);

    // Seed categories first
    console.log('Seeding categories...');
    const categories = [
      { slug: 'coding', name: 'Coding', icon: '💻', description: 'AI tools for software development and programming', sort_order: 1 },
      { slug: 'productivity', name: 'Productivity', icon: '⚡', description: 'AI tools to boost your productivity', sort_order: 2 },
      { slug: 'content', name: 'Content Creation', icon: '✍️', description: 'AI tools for writing and content', sort_order: 3 },
      { slug: 'design', name: 'Design', icon: '🎨', description: 'AI tools for visual design and creativity', sort_order: 4 },
      { slug: 'marketing', name: 'Marketing', icon: '📈', description: 'AI tools for marketing and sales', sort_order: 5 },
      { slug: 'research', name: 'Research', icon: '🔍', description: 'AI tools for research and analysis', sort_order: 6 },
      { slug: 'audio', name: 'Audio', icon: '🎵', description: 'AI tools for audio and voice', sort_order: 7 },
      { slug: 'video', name: 'Video', icon: '🎬', description: 'AI tools for video editing and generation', sort_order: 8 },
      { slug: 'ai-models', name: 'AI Models', icon: '🤖', description: 'Foundation models and APIs', sort_order: 9 },
    ];

    const { error: catError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' });

    if (catError) throw catError;
    console.log(`✓ Seeded ${categories.length} categories\n`);

    // Get category IDs
    const { data: cats } = await supabase.from('categories').select('id, slug');
    const categoryMap = new Map(cats?.map(c => [c.slug, c.id]));

    // Helper to map category
    const mapCategory = (categoryId: string | undefined) => {
      // Try to map old category IDs to new slugs
      const categoryMapping: Record<string, string> = {
        '59a9e02c-ecd9-4f3e-98b9-967daea5775c': 'coding',
        '681664d9-7fa5-4ee2-b331-e40a24181a65': 'productivity',
        'd16cbc6a-349e-46ab-9967-066f5995de86': 'design',
        '425e4bae-76b3-4f71-a4c1-197e1cc623ed': 'content',
        '442bd76f-18b3-4509-a0ee-7e6f1c55d1d7': 'marketing',
      };

      const slug = categoryMapping[categoryId || ''] || 'productivity';
      return categoryMap.get(slug);
    };

    // Convert tools to our schema
    console.log('Converting and seeding tools...');
    const toolsToInsert = toolsData.map((tool: any) => ({
      slug: tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: tool.name,
      tagline: tool.description,
      description: tool.description,
      website_url: tool.websiteUrl || '',
      source_url: tool.websiteUrl || '',
      pricing_summary: tool.pricing || 'Contact for pricing',
      pricing_model: tool.pricingModel === 'subscription' ? 'subscription' : tool.pricing === 'Free' ? 'free' : 'contact',
      has_free_tier: tool.pricing?.toLowerCase().includes('free') || false,
      platforms: tool.platforms || ['Web'],
      features: tool.features || [],
      editorial_score: tool.featured ? 85 : 70,
      editorial_why: null,
      is_sponsored: false,
      status: 'published',
      last_verified_at: new Date().toISOString(),
    }));

    const { data: insertedTools, error: toolsError } = await supabase
      .from('tools')
      .upsert(toolsToInsert, { onConflict: 'slug' })
      .select();

    if (toolsError) throw toolsError;
    console.log(`✓ Seeded ${insertedTools?.length || 0} tools\n`);

    // Link tools to categories
    if (insertedTools) {
      console.log('Linking tools to categories...');
      const toolCategoryRelations = insertedTools.map((tool, index) => {
        const originalTool = toolsData[index];
        const categoryId = mapCategory(originalTool.categoryId);
        
        return {
          tool_id: tool.id,
          category_id: categoryId,
          is_primary: true,
        };
      }).filter(rel => rel.category_id);

      const { error: relError } = await supabase
        .from('tool_categories')
        .upsert(toolCategoryRelations, { onConflict: 'tool_id,category_id' });

      if (relError) throw relError;
      console.log(`✓ Created ${toolCategoryRelations.length} tool-category relationships\n`);
    }

    console.log('✅ Database seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`- ${categories.length} categories`);
    console.log(`- ${insertedTools?.length || 0} tools`);
    console.log(`- All tools set to 'published' status`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
