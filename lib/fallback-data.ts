// Fallback data for build time when Supabase isn't available
// This allows `npm run build` to succeed without credentials

export const fallbackTools = [
  {
    id: '534344ff-cf6a-4e79-9975-732cfc72da97',
    slug: 'cursor',
    name: 'Cursor',
    tagline: 'The AI-first code editor built for pair programming with AI',
    description: 'Cursor is a code editor designed from the ground up for AI pair programming. It provides natural language code generation, multi-file editing, and deep codebase understanding.',
    website_url: 'https://cursor.com',
    source_url: 'https://cursor.com/pricing',
    pricing_summary: '$20/month',
    pricing_model: 'subscription',
    has_free_tier: true,
    platforms: ['Desktop'],
    features: ['AI code generation', 'Natural language editing', 'Codebase understanding', 'Multi-file editing'],
    editorial_score: 95,
    editorial_why: 'Best-in-class AI code editor with deep understanding of your codebase',
    is_sponsored: false,
    status: 'published',
    last_verified_at: '2026-10-10T00:00:00Z',
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
  },
  {
    id: '5c9e644a-9506-4a30-93c0-ad0af8030dcd',
    slug: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'Advanced AI assistant for writing, coding, and problem-solving',
    description: 'ChatGPT is OpenAI\'s conversational AI that can help with writing, coding, analysis, and creative tasks. The Plus version includes GPT-4 access and additional features.',
    website_url: 'https://chat.openai.com',
    source_url: 'https://openai.com/chatgpt/pricing',
    pricing_summary: '$20/month',
    pricing_model: 'subscription',
    has_free_tier: true,
    platforms: ['Web', 'iOS', 'Android'],
    features: ['Advanced reasoning', 'Code execution', 'Web browsing', 'Image generation'],
    editorial_score: 98,
    editorial_why: 'The original and still one of the most versatile AI assistants',
    is_sponsored: false,
    status: 'published',
    last_verified_at: '2026-10-10T00:00:00Z',
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
  },
];

export const fallbackCategories = [
  {
    id: '59a9e02c-ecd9-4f3e-98b9-967daea5775c',
    slug: 'coding',
    name: 'Coding',
    icon: '💻',
    description: 'AI tools for software development and programming',
    sort_order: 1,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
  },
  {
    id: '681664d9-7fa5-4ee2-b331-e40a24181a65',
    slug: 'productivity',
    name: 'Productivity',
    icon: '⚡',
    description: 'AI tools to boost your productivity and efficiency',
    sort_order: 2,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
  },
];

export const fallbackToolCategories = [
  {
    tool_id: '534344ff-cf6a-4e79-9975-732cfc72da97',
    category_id: '59a9e02c-ecd9-4f3e-98b9-967daea5775c',
    is_primary: true,
  },
  {
    tool_id: '5c9e644a-9506-4a30-93c0-ad0af8030dcd',
    category_id: '681664d9-7fa5-4ee2-b331-e40a24181a65',
    is_primary: true,
  },
];
