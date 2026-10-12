export const CATALOG_PAGE_SIZE = 24;

export type TaxonomySlug =
  | 'chat-assistants'
  | 'writing'
  | 'image'
  | 'video'
  | 'audio-voice'
  | 'music'
  | 'coding'
  | 'agents-automation'
  | 'research-notes'
  | 'email'
  | 'slides'
  | 'design'
  | 'marketing'
  | 'productivity'
  | 'local-open-source';

export type TaxonomyCategory = {
  slug: TaxonomySlug;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
};

export const TAXONOMY: TaxonomyCategory[] = [
  { slug: 'chat-assistants', name: 'Chat assistants', description: 'General chat models and assistants for questions, drafts, and everyday work', icon: '💬', sort_order: 1 },
  { slug: 'writing', name: 'Writing', description: 'Draft, edit, and polish copy, posts, and documents', icon: '✍️', sort_order: 2 },
  { slug: 'image', name: 'Image', description: 'Generate and edit images from a prompt', icon: '🖼️', sort_order: 3 },
  { slug: 'video', name: 'Video', description: 'Generate, edit, caption, and repurpose video', icon: '🎬', sort_order: 4 },
  { slug: 'audio-voice', name: 'Audio and voice', description: 'Speech, voice, transcription, and text-to-speech', icon: '🎙️', sort_order: 5 },
  { slug: 'music', name: 'Music', description: 'Generate songs, beats, and background music', icon: '🎵', sort_order: 6 },
  { slug: 'coding', name: 'Coding', description: 'AI pair programmers, coding agents, and app builders', icon: '💻', sort_order: 7 },
  { slug: 'agents-automation', name: 'Agents and automation', description: 'Autonomous agents and workflow automation', icon: '🤖', sort_order: 8 },
  { slug: 'research-notes', name: 'Research and notes', description: 'Research, notes, documents, and knowledge workspaces', icon: '📚', sort_order: 9 },
  { slug: 'email', name: 'Email', description: 'Inbox, outreach, and email drafting', icon: '✉️', sort_order: 10 },
  { slug: 'slides', name: 'Slides and presentations', description: 'Decks, slides, and visual presentations', icon: '📊', sort_order: 11 },
  { slug: 'design', name: 'Design', description: 'Layouts, graphics, and visual design', icon: '🎨', sort_order: 12 },
  { slug: 'marketing', name: 'Marketing', description: 'Campaigns, social posts, and go-to-market copy', icon: '📈', sort_order: 13 },
  { slug: 'productivity', name: 'Productivity', description: 'Everyday work tools that do not fit a more specific job', icon: '⚡', sort_order: 14 },
  { slug: 'local-open-source', name: 'Local and open-source models', description: 'Run models locally, self-host, or use open weights', icon: '🏠', sort_order: 15 },
];

export const CATEGORY_ALIASES: Record<string, TaxonomySlug> = {
  content: 'writing',
  'ai-models': 'local-open-source',
  'llm-large-language-model': 'chat-assistants',
  audio: 'audio-voice',
  voice: 'audio-voice',
  agents: 'agents-automation',
  automation: 'agents-automation',
  research: 'research-notes',
  notes: 'research-notes',
  presentations: 'slides',
};

export const INTENT_CATEGORY_SLUGS: Record<string, TaxonomySlug[]> = {
  chat: ['chat-assistants'],
  chatbot: ['chat-assistants'],
  assistant: ['chat-assistants'],
  llm: ['chat-assistants'],
  write: ['writing'],
  writing: ['writing'],
  image: ['image', 'design'],
  art: ['image', 'design'],
  video: ['video'],
  audio: ['audio-voice', 'music'],
  voice: ['audio-voice'],
  music: ['music'],
  code: ['coding'],
  coding: ['coding'],
  agent: ['agents-automation'],
  automate: ['agents-automation'],
  research: ['research-notes'],
  notes: ['research-notes'],
  email: ['email'],
  slides: ['slides', 'design'],
  design: ['design', 'image'],
};

export const CATEGORY_SORTS = ['relevance', 'free', 'newest'] as const;
export type CategorySort = (typeof CATEGORY_SORTS)[number];

const PRIMARY_ORDER: TaxonomySlug[] = [
  'music',
  'video',
  'audio-voice',
  'slides',
  'email',
  'image',
  'writing',
  'coding',
  'agents-automation',
  'research-notes',
  'chat-assistants',
  'design',
  'marketing',
  'local-open-source',
  'productivity',
];

type Classifiable = {
  name?: string | null;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  tags?: string[] | null;
  features?: string[] | null;
};

function haystackOf(tool: Classifiable): string {
  return [
    tool.name,
    tool.slug,
    tool.tagline,
    ...(tool.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function hasAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => {
    if (needle.length <= 4 || /[.\s]/.test(needle)) {
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`).test(haystack);
    }
    return haystack.includes(needle);
  });
}

export function normalizeCategorySlug(slug: string | null | undefined): string | null {
  if (!slug || slug === 'all') return null;
  return CATEGORY_ALIASES[slug] || slug;
}

export function classifyTool(tool: Classifiable): { slugs: TaxonomySlug[]; primary: TaxonomySlug } {
  const hay = haystackOf(tool);
  const matched = new Set<TaxonomySlug>();

  if (hasAny(hay, ['music', 'song-generation', 'beats', 'background-music', 'suno', 'udio', 'soundraw'])) {
    matched.add('music');
  }
  if (hasAny(hay, ['video', 'text-to-video', 'captions', 'subtitles', 'short-form', 'ai-avatars', 'descript', 'runway', 'pika', 'heygen', 'synthesia', 'capcut', 'opusclip', 'kdenlive'])) {
    matched.add('video');
  }
  if (hasAny(hay, ['audio', 'voice', 'transcription', 'text-to-speech', 'voice-cloning', 'voiceover', 'whisper', 'dubbing', 'elevenlabs', 'murf', 'otter', 'fireflies', 'vibe'])) {
    matched.add('audio-voice');
  }
  if (hasAny(hay, ['slides', 'presentations', 'infographics', 'gamma', 'beautiful.ai', 'pitch', 'napkin'])) {
    matched.add('slides');
  }
  if (hasAny(hay, ['email', 'gmail', 'inbox', 'shortwave', 'superhuman', 'lavender'])) {
    matched.add('email');
  }
  if (hasAny(hay, ['image', 'text-to-image', 'photos', 'stable-diffusion', 'midjourney', 'dall-e', 'ideogram', 'leonardo', 'firefly', 'invoke', 'comfyui'])) {
    matched.add('image');
  }
  if (hasAny(hay, ['writing', 'copywrit', 'grammarly', 'jasper', 'copy.ai'])) {
    matched.add('writing');
  }
  if (hasAny(hay, ['coding', 'developer', 'copilot', 'cursor', 'replit', 'bolt', 'v0', 'windsurf', 'cline', 'codex', 'continue', 'lovable', 'opencode', 'jetbrains', 'vscode', 'pair programmer'])) {
    matched.add('coding');
  }
  if (hasAny(hay, ['agents', 'agent', 'automation', 'multi-agent', 'browser-automation', 'workflows', 'rpa', 'zapier', 'autogpt', 'agentgpt', 'langchain', 'lindy', 'skyvern', 'activepieces'])) {
    matched.add('agents-automation');
  }
  if (hasAny(hay, ['research', 'notes', 'documents', 'citations', 'academic', 'papers', 'knowledge-base', 'notebooklm', 'rag', 'pdf', 'notion', 'elicit', 'consensus', 'perplexity', 'granola', 'mem', 'paperless'])) {
    matched.add('research-notes');
  }
  if (hasAny(hay, ['chat', 'assistant', 'chatgpt', 'claude pro', 'gemini pro', 'librechat', 'cherry studio']) || /\b(claude|gemini)\b/.test(hay)) {
    matched.add('chat-assistants');
  }
  if (hasAny(hay, ['design', 'creative', 'diagrams', 'typography', 'visuals', 'canva'])) {
    matched.add('design');
  }
  if (hasAny(hay, ['marketing', 'social-media', 'sales', 'campaign'])) {
    matched.add('marketing');
  }
  if (hasAny(hay, ['local-llm', 'self-hosted', 'offline', 'ollama', 'llama.cpp', 'localai', 'privategpt', 'open weights'])) {
    matched.add('local-open-source');
  }

  if (matched.size === 0) {
    matched.add('productivity');
  }

  const slugs = PRIMARY_ORDER.filter((slug) => matched.has(slug));
  const name = `${tool.name || ''} ${tool.slug || ''}`.toLowerCase();
  let primary = slugs[0] || 'productivity';
  if (/chatgpt|claude-pro|gemini-pro/.test(name) || /chatgpt plus|claude pro|gemini pro/.test(name)) {
    primary = 'chat-assistants';
  } else if (hasAny(hay, ['local-llm', 'ollama', 'llama.cpp', 'localai'])) {
    primary = 'local-open-source';
  }
  return { slugs: slugs.includes(primary) ? slugs : [primary, ...slugs], primary };
}

export function parseCategorySort(value: string | null | undefined): CategorySort {
  return CATEGORY_SORTS.includes(value as CategorySort) ? (value as CategorySort) : 'relevance';
}

export function parsePage(value: string | null | undefined): number {
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), 200);
}
