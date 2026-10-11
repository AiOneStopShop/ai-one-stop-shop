export const SEARCH_QUERY_MAX = 100;
export const SEARCH_DEBOUNCE_MS = 200;
export const TRIGRAM_MATCH_THRESHOLD = 0.25;

export const SEARCH_SYNONYMS: Record<string, readonly string[]> = {
  writing: ['copy', 'content', 'grammar', 'copywriting', 'copywriter'],
  copy: ['writing', 'content', 'copywriting'],
  content: ['writing', 'copy'],
  grammar: ['writing'],
  image: ['art', 'generation', 'generate', 'images'],
  art: ['image', 'generation', 'images', 'design'],
  code: ['coding', 'developer', 'development', 'copilot', 'programmer'],
  coding: ['code', 'developer', 'development', 'copilot', 'programmer'],
  video: ['film', 'podcast', 'recording'],
  voice: ['audio', 'speech', 'tts', 'cloning'],
  audio: ['voice', 'speech', 'podcast'],
  chatbot: ['assistant', 'chat'],
  assistant: ['chatbot', 'chat'],
};

export type SearchableTool = {
  name?: string | null;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  features?: string[] | null;
  platforms?: string[] | null;
  tags?: string[] | null;
  pricing_model?: string | null;
  has_free_tier?: boolean | null;
  status?: string | null;
  tool_categories?: Array<{
    categories?: {
      name?: string | null;
      slug?: string | null;
      description?: string | null;
    } | null;
  } | null> | null;
};

export type SearchToolsOptions = {
  q?: string;
  category?: string;
  price?: string;
  freeOnly?: boolean;
  limit?: number;
  offset?: number;
};

export function escapeLikePattern(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .substring(0, SEARCH_QUERY_MAX);
}

export function sanitizeSearchQuery(input: string | null | undefined): string {
  return (input || '')
    .replace(/[&|!:*()<>'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SEARCH_QUERY_MAX);
}

export function tokenizeSearchQuery(input: string): string[] {
  const sanitized = sanitizeSearchQuery(input);
  if (!sanitized) return [];
  return sanitized.toLowerCase().split(' ').filter(Boolean);
}

export function expandSearchTerms(input: string): string[] {
  const tokens = tokenizeSearchQuery(input);
  const terms = new Set<string>(tokens);
  for (const token of tokens) {
    const synonyms = SEARCH_SYNONYMS[token];
    if (synonyms) {
      for (const synonym of synonyms) terms.add(synonym);
    }
  }
  return Array.from(terms);
}

function trigrams(value: string): Set<string> {
  const padded = `  ${value.toLowerCase()} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i += 1) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

export function trigramSimilarity(a: string, b: string): number {
  const left = (a || '').trim();
  const right = (b || '').trim();
  if (!left || !right) return 0;
  const aGrams = trigrams(left);
  const bGrams = trigrams(right);
  let intersection = 0;
  Array.from(aGrams).forEach((gram) => {
    if (bGrams.has(gram)) intersection += 1;
  });
  return intersection / Math.max(1, aGrams.size + bGrams.size - intersection);
}

export function collectSearchText(tool: SearchableTool): string[] {
  const values: string[] = [
    tool.name,
    tool.slug,
    tool.tagline,
    tool.description,
    ...(tool.features || []),
    ...(tool.platforms || []),
    ...(tool.tags || []),
  ].filter((value): value is string => Boolean(value));

  for (const relation of tool.tool_categories || []) {
    const category = relation?.categories;
    if (!category) continue;
    if (category.name) values.push(category.name);
    if (category.slug) values.push(category.slug);
    if (category.description) values.push(category.description);
  }

  return values;
}

function fieldWeight(field: 'name' | 'b' | 'description'): number {
  if (field === 'name') return 3;
  if (field === 'description') return 1;
  return 2;
}

function includesTerm(haystack: string, term: string): boolean {
  return haystack.toLowerCase().includes(term);
}

function nameSimilarity(tool: SearchableTool, query: string): number {
  const candidates = [
    tool.name || '',
    tool.slug || '',
    (tool.slug || '').replace(/-/g, ' '),
    ...(tool.name || '').split(/\s+/).filter((word) => word.length > 2),
  ];
  return Math.max(0, ...candidates.map((candidate) => trigramSimilarity(candidate, query)));
}

export function scoreTool(tool: SearchableTool, rawQuery: string): number {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query) return 0;

  const terms = expandSearchTerms(query);
  const name = tool.name || '';
  const tagline = tool.tagline || '';
  const description = tool.description || '';
  const bFields = [
    tagline,
    ...(tool.features || []),
    ...(tool.platforms || []),
    ...(tool.tags || []),
    ...(tool.tool_categories || []).flatMap((relation) => {
      const category = relation?.categories;
      return [category?.name, category?.slug, category?.description].filter(
        (value): value is string => Boolean(value)
      );
    }),
  ];

  let score = 0;
  for (const term of terms) {
    if (includesTerm(name, term)) score += fieldWeight('name');
    if (bFields.some((field) => includesTerm(field, term))) score += fieldWeight('b');
    if (includesTerm(description, term)) score += fieldWeight('description');
  }

  score += nameSimilarity(tool, query) * 2;
  score += trigramSimilarity(tagline, query) * 0.8;
  return score;
}

export function toolMatchesQuery(tool: SearchableTool, rawQuery: string): boolean {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query) return true;

  const terms = expandSearchTerms(query);
  const haystacks = collectSearchText(tool);
  const termHit = terms.some((term) =>
    haystacks.some((value) => includesTerm(value, term))
  );
  if (termHit) return true;

  return (
    nameSimilarity(tool, query) >= TRIGRAM_MATCH_THRESHOLD
    || trigramSimilarity(tool.tagline || '', query) >= TRIGRAM_MATCH_THRESHOLD
  );
}

function matchesFilters(tool: SearchableTool, options: SearchToolsOptions): boolean {
  const category = options.category && options.category !== 'all' ? options.category : '';
  const price = options.price && options.price !== 'all' ? options.price : '';

  if (category) {
    const hasCategory = (tool.tool_categories || []).some(
      (relation) => relation?.categories?.slug === category
    );
    if (!hasCategory) return false;
  }

  if (options.freeOnly && !tool.has_free_tier) return false;

  if (price && tool.pricing_model !== price) return false;

  return true;
}

export function searchTools<T extends SearchableTool>(
  tools: T[],
  options: SearchToolsOptions = {}
): T[] {
  const query = sanitizeSearchQuery(options.q);
  const limit = Math.min(Math.max(options.limit ?? tools.length, 1), options.limit ? 50 : tools.length);
  const offset = Math.max(options.offset ?? 0, 0);

  const filtered = tools.filter((tool) => {
    if (tool.status && tool.status !== 'published') return false;
    if (!matchesFilters(tool, options)) return false;
    return toolMatchesQuery(tool, query);
  });

  if (query) {
    filtered.sort((left, right) => {
      const rank = scoreTool(right, query) - scoreTool(left, query);
      if (rank !== 0) return rank;
      return (left.name || '').localeCompare(right.name || '');
    });
  }

  return filtered.slice(offset, offset + limit);
}

export function suggestDidYouMean<T extends SearchableTool>(
  rawQuery: string,
  tools: T[],
  threshold = 0.32
): T | null {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query || query.length < 3) return null;

  let best: T | null = null;
  let bestScore = threshold;
  for (const tool of tools) {
    if (tool.status && tool.status !== 'published') continue;
    const score = nameSimilarity(tool, query);
    if (score > bestScore) {
      best = tool;
      bestScore = score;
    }
  }
  return best;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightSegments(text: string, rawQuery: string): Array<{ text: string; match: boolean }> {
  const terms = expandSearchTerms(rawQuery)
    .filter((term) => term.length >= 2)
    .sort((a, b) => b.length - a.length);
  if (!text || terms.length === 0) {
    return text ? [{ text, match: false }] : [];
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig');
  const parts = text.split(pattern);
  return parts
    .filter((part) => part !== '')
    .map((part) => ({
      text: part,
      match: terms.some((term) => part.toLowerCase() === term.toLowerCase()),
    }));
}
