// Generate static fallback data from JSON files
import * as fs from 'fs';
import * as path from 'path';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const categoryMapping: Record<string, string> = {
  '59a9e02c-ecd9-4f3e-98b9-967daea5775c': 'coding',
  '681664d9-7fa5-4ee2-b331-e40a24181a65': 'productivity',
  'd16cbc6a-349e-46ab-9967-066f5995de86': 'design',
  '425e4bae-76b3-4f71-a4c1-197e1cc623ed': 'content',
  '442bd76f-18b3-4509-a0ee-7e6f1c55d1d7': 'marketing',
};

const categories = [
  { id: '1', slug: 'coding', name: 'Coding', icon: '💻', description: 'AI tools for software development', sort_order: 1, created_at: '2026-10-10T00:00:00Z', updated_at: '2026-10-10T00:00:00Z' },
  { id: '2', slug: 'productivity', name: 'Productivity', icon: '⚡', description: 'AI tools to boost productivity', sort_order: 2, created_at: '2026-10-10T00:00:00Z', updated_at: '2026-10-10T00:00:00Z' },
  { id: '3', slug: 'content', name: 'Content', icon: '✍️', description: 'AI tools for writing and content', sort_order: 3, created_at: '2026-10-10T00:00:00Z', updated_at: '2026-10-10T00:00:00Z' },
  { id: '4', slug: 'design', name: 'Design', icon: '🎨', description: 'AI tools for design and creativity', sort_order: 4, created_at: '2026-10-10T00:00:00Z', updated_at: '2026-10-10T00:00:00Z' },
  { id: '5', slug: 'marketing', name: 'Marketing', icon: '📈', description: 'AI tools for marketing', sort_order: 5, created_at: '2026-10-10T00:00:00Z', updated_at: '2026-10-10T00:00:00Z' },
  { id: '6', slug: 'ai-models', name: 'AI Models', icon: '🤖', description: 'Foundation models and APIs', sort_order: 6, created_at: '2026-10-10T00:00:00Z', updated_at: '2026-10-10T00:00:00Z' },
];

const uploadsDir = process.env.HOME ? path.join(process.env.HOME, '.cursor/projects/workspace/uploads') : path.join(process.cwd(), 'uploads');
const toolsPath = path.join(uploadsDir, 'api-tools_2a75.json');
const agentsPath = path.join(uploadsDir, 'api-agents_f655.json');

const toolsData = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
const agentsData = JSON.parse(fs.readFileSync(agentsPath, 'utf-8'));

const tools = toolsData.map((tool: any) => {
  const categorySlug = categoryMapping[tool.categoryId] || 'productivity';
  const category = categories.find(c => c.slug === categorySlug);

  return {
    id: tool.id,
    slug: slugify(tool.name),
    name: tool.name,
    tagline: tool.description,
    description: tool.description,
    website_url: tool.websiteUrl || 'https://example.com',
    source_url: tool.websiteUrl || 'https://example.com',
    pricing_summary: tool.pricing || 'Contact for pricing',
    pricing_model: tool.pricingModel === 'subscription' ? 'subscription' : 'contact',
    has_free_tier: tool.pricing?.toLowerCase().includes('free') || false,
    platforms: tool.platforms || ['Web'],
    features: tool.features || [],
    editorial_score: tool.featured ? 85 : 70,
    editorial_why: null,
    is_sponsored: false,
    status: 'published',
    last_verified_at: '2026-10-10T00:00:00Z',
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
    tool_categories: [{
      category_id: category?.id,
      is_primary: true,
      categories: category,
    }],
  };
});

const agents = agentsData.map((agent: any) => {
  const category = categories.find(c => c.slug === 'ai-models');

  return {
    id: agent.id,
    slug: slugify(agent.name),
    name: agent.name,
    tagline: agent.description,
    description: agent.description,
    website_url: agent.websiteUrl || 'https://example.com',
    source_url: agent.websiteUrl || 'https://example.com',
    pricing_summary: agent.pricing || 'Contact for pricing',
    pricing_model: agent.pricing?.toLowerCase().includes('free') ? 'free' : 'pay-per-use',
    has_free_tier: agent.pricing?.toLowerCase().includes('free') || false,
    platforms: agent.platforms || ['API'],
    features: agent.capabilities || [],
    editorial_score: agent.featured ? 85 : 70,
    editorial_why: null,
    is_sponsored: false,
    status: 'published',
    last_verified_at: '2026-10-10T00:00:00Z',
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
    tool_categories: [{
      category_id: category?.id,
      is_primary: true,
      categories: category,
    }],
  };
});

const allTools = [...tools, ...agents];

const toolCategories = allTools.map(tool => ({
  tool_id: tool.id,
  category_id: tool.tool_categories[0]?.category_id,
  is_primary: true,
})).filter(tc => tc.category_id);

const output = `// Auto-generated fallback data from JSON files
// Generated on ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - run 'npm run generate-fallback' instead

export const fallbackTools = ${JSON.stringify(allTools, null, 2)};

export const fallbackCategories = ${JSON.stringify(categories, null, 2)};

export const fallbackToolCategories = ${JSON.stringify(toolCategories, null, 2)};
`;

const outputPath = path.join(process.cwd(), 'lib', 'fallback-data.ts');
fs.writeFileSync(outputPath, output);

console.log(`✓ Generated fallback data with ${tools.length} tools + ${agents.length} agents = ${allTools.length} total`);
console.log(`✓ Written to ${outputPath}`);
