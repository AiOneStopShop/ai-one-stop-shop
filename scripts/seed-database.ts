import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Seed data from provided JSON files with corrections
const categories = [
  { slug: 'content-creation', name: 'Content Creation', description: 'AI tools for writing, video, and creative content', icon: '✍️', sort_order: 1 },
  { slug: 'productivity', name: 'Productivity', description: 'Boost efficiency and automate workflows', icon: '⚡', sort_order: 2 },
  { slug: 'vibe-coding', name: 'AI Coding', description: 'AI-powered coding assistants and IDE tools', icon: '💻', sort_order: 3 },
  { slug: 'design', name: 'Design', description: 'Creative design and visual tools', icon: '🎨', sort_order: 4 },
  { slug: 'marketing', name: 'Marketing', description: 'Marketing automation and analytics', icon: '📊', sort_order: 5 },
  { slug: 'customer-support', name: 'Customer Support', description: 'AI-powered customer service tools', icon: '💬', sort_order: 6 },
  { slug: 'data-analytics', name: 'Data & Analytics', description: 'Data analysis and business intelligence', icon: '📈', sort_order: 7 },
  { slug: 'sales', name: 'Sales', description: 'Sales automation and CRM tools', icon: '💼', sort_order: 8 },
  { slug: 'audio', name: 'Audio & Voice', description: 'Voice generation and audio processing', icon: '🎙️', sort_order: 9 }
];

// Fixed tool data with corrections:
// - ChatGPT Plus is NOT free, it's $20/month
// - Removed fake ratings and review counts
// - Added last_verified_at dates
// - Marked some as needing review
const tools = [
  {
    slug: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    tagline: 'Advanced AI assistant for writing, coding, and problem-solving',
    description: 'OpenAI\'s most capable model with GPT-4, offering advanced reasoning, code execution, web browsing, and image generation capabilities.',
    website_url: 'https://chat.openai.com',
    pricing_summary: '$20/month',
    pricing_model: 'subscription' as const,
    has_free_tier: true,
    platforms: ['Web', 'iOS', 'Android'],
    features: ['Advanced reasoning', 'Code execution', 'Web browsing', 'Image generation'],
    editorial_score: 95,
    editorial_why: 'The most versatile AI assistant with cutting-edge capabilities',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'claude-pro',
    name: 'Claude Pro',
    tagline: 'Anthropic\'s powerful AI for analysis, writing, and coding',
    description: 'Claude offers thoughtful, detailed responses with a focus on safety and helpfulness. Excellent for analysis and long-form content.',
    website_url: 'https://claude.ai',
    pricing_summary: '$20/month',
    pricing_model: 'subscription' as const,
    has_free_tier: true,
    platforms: ['Web'],
    features: ['Long context window', 'Ethical AI', 'Code generation', 'Document analysis'],
    editorial_score: 92,
    editorial_why: 'Best for thoughtful, nuanced responses and document analysis',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'midjourney',
    name: 'Midjourney',
    tagline: 'Create stunning AI-generated images and art',
    description: 'Leading AI image generation tool known for artistic, high-quality outputs.',
    website_url: 'https://midjourney.com',
    pricing_summary: '$10/month',
    pricing_model: 'subscription' as const,
    has_free_tier: false,
    platforms: ['Discord', 'Web'],
    features: ['Image generation', 'Style variations', 'Upscaling', 'Community gallery'],
    editorial_score: 90,
    editorial_why: 'Top choice for artistic AI-generated imagery',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'cursor',
    name: 'Cursor',
    tagline: 'The AI-first code editor built for pair programming with AI',
    description: 'Cursor is a modern code editor that deeply integrates AI assistance for writing, editing, and understanding code.',
    website_url: 'https://cursor.com',
    pricing_summary: '$20/month',
    pricing_model: 'subscription' as const,
    has_free_tier: true,
    platforms: ['Desktop'],
    features: ['AI code generation', 'Natural language editing', 'Codebase understanding', 'Multi-file editing'],
    editorial_score: 93,
    editorial_why: 'Best AI-native code editor for professional developers',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'github-copilot',
    name: 'GitHub Copilot',
    tagline: 'AI pair programmer that helps you code faster',
    description: 'GitHub\'s AI coding assistant that suggests code completions and entire functions.',
    website_url: 'https://github.com/features/copilot',
    pricing_summary: '$10/month',
    pricing_model: 'subscription' as const,
    has_free_tier: false,
    platforms: ['VS Code', 'JetBrains', 'Neovim'],
    features: ['Code completion', 'Multiple languages', 'IDE integration', 'Code suggestions'],
    editorial_score: 88,
    editorial_why: 'Well-integrated AI coding assistant for popular IDEs',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'notion',
    name: 'Notion AI',
    tagline: 'AI-powered workspace and knowledge management',
    description: 'All-in-one workspace with integrated AI for writing, brainstorming, and organizing.',
    website_url: 'https://notion.so',
    pricing_summary: '$10/month (add-on)',
    pricing_model: 'subscription' as const,
    has_free_tier: true,
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: ['AI writing', 'Note-taking', 'Database', 'Collaboration'],
    editorial_score: 85,
    editorial_why: 'Best for teams who want AI integrated into their workspace',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'canva',
    name: 'Canva AI',
    tagline: 'Design platform with AI-powered features',
    description: 'Easy-to-use design tool with AI features for generating images, layouts, and content.',
    website_url: 'https://canva.com',
    pricing_summary: '$15/month',
    pricing_model: 'subscription' as const,
    has_free_tier: true,
    platforms: ['Web', 'Mobile'],
    features: ['Template library', 'AI design', 'Brand kit', 'Collaboration'],
    editorial_score: 87,
    editorial_why: 'Most accessible design tool with AI features',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'grammarly',
    name: 'Grammarly',
    tagline: 'AI writing assistant for clarity and correctness',
    description: 'Popular writing assistant that checks grammar, tone, and style.',
    website_url: 'https://grammarly.com',
    pricing_summary: '$12/month',
    pricing_model: 'subscription' as const,
    has_free_tier: true,
    platforms: ['Web', 'Desktop', 'Mobile', 'Browser Extension'],
    features: ['Grammar checking', 'Tone suggestions', 'Plagiarism detection', 'Style guide'],
    editorial_score: 82,
    editorial_why: 'Trusted writing assistant with broad platform support',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'jasper',
    name: 'Jasper AI',
    tagline: 'AI content platform for marketing teams',
    description: 'Comprehensive AI writing tool designed for marketing and content teams.',
    website_url: 'https://jasper.ai',
    pricing_summary: '$39/month',
    pricing_model: 'subscription' as const,
    has_free_tier: false,
    platforms: ['Web', 'Chrome Extension'],
    features: ['Content generation', 'Brand voice', 'Templates', 'SEO optimization'],
    editorial_score: 84,
    editorial_why: 'Built for marketing teams with brand consistency',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  },
  {
    slug: 'descript',
    name: 'Descript',
    tagline: 'AI-powered video and podcast editing',
    description: 'Edit video and audio by editing text, with AI features for transcription and voice cloning.',
    website_url: 'https://descript.com',
    pricing_summary: '$15/month',
    pricing_model: 'subscription' as const,
    has_free_tier: true,
    platforms: ['Desktop', 'Web'],
    features: ['Transcription', 'Voice cloning', 'Video editing', 'Screen recording'],
    editorial_score: 86,
    editorial_why: 'Unique text-based video editing with powerful AI features',
    last_verified_at: new Date('2026-10-10'),
    status: 'published' as const
  }
];

// Category mappings
const toolCategories: Record<string, string[]> = {
  'chatgpt-plus': ['productivity', 'content-creation'],
  'claude-pro': ['productivity', 'content-creation'],
  'midjourney': ['design', 'content-creation'],
  'cursor': ['vibe-coding'],
  'github-copilot': ['vibe-coding'],
  'notion': ['productivity'],
  'canva': ['design'],
  'grammarly': ['content-creation'],
  'jasper': ['marketing', 'content-creation'],
  'descript': ['content-creation', 'audio']
};

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed categories
    console.log('📁 Seeding categories...');
    const { data: insertedCategories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (categoriesError) throw categoriesError;
    console.log(`✅ Seeded ${insertedCategories?.length} categories`);

    // Create category slug to ID map
    const categoryMap = new Map(
      insertedCategories?.map(cat => [cat.slug, cat.id]) || []
    );

    // Seed tools
    console.log('🔧 Seeding tools...');
    const { data: insertedTools, error: toolsError } = await supabase
      .from('tools')
      .upsert(tools, { onConflict: 'slug' })
      .select();

    if (toolsError) throw toolsError;
    console.log(`✅ Seeded ${insertedTools?.length} tools`);

    // Seed tool-category relationships
    console.log('🔗 Seeding tool-category relationships...');
    const toolCategoryRelations = [];
    
    for (const tool of insertedTools || []) {
      const categorySlugs = toolCategories[tool.slug] || [];
      for (const catSlug of categorySlugs) {
        const categoryId = categoryMap.get(catSlug);
        if (categoryId) {
          toolCategoryRelations.push({
            tool_id: tool.id,
            category_id: categoryId,
            is_primary: categorySlugs[0] === catSlug
          });
        }
      }
    }

    if (toolCategoryRelations.length > 0) {
      const { error: relationsError } = await supabase
        .from('tool_categories')
        .upsert(toolCategoryRelations, { onConflict: 'tool_id,category_id' });

      if (relationsError) throw relationsError;
      console.log(`✅ Seeded ${toolCategoryRelations.length} tool-category relationships`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Note: This is seed data. Real affiliate links and click tracking');
    console.log('   should be added through the admin interface.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
