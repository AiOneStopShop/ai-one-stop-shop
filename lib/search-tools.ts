export const SEARCH_QUERY_MAX = 100;
export const SEARCH_DEBOUNCE_MS = 200;
export const TRIGRAM_MATCH_THRESHOLD = 0.4;
export const SEARCH_MIN_SCORE = 1.5;
export const SHORT_QUERY_MAX = 4;

const AUDIO_SYNONYMS = ['voice', 'audio', 'speech', 'tts', 'cloning', 'text to speech'] as const;
const WRITING_SYNONYMS = ['write', 'writing', 'copy', 'content', 'grammar', 'copywriting', 'copywriter'] as const;
const CHAT_SYNONYMS = ['chat', 'chatbot', 'assistant', 'llm', 'conversation', 'chatgpt', 'claude', 'gemini'] as const;
const MUSIC_SYNONYMS = ['music', 'audio', 'song', 'soundtrack', 'voice', 'speech'] as const;

export const SEARCH_PHRASES: Array<{ phrase: string; terms: readonly string[] }> = [
  { phrase: 'text to speech', terms: AUDIO_SYNONYMS },
];

export const SEARCH_SYNONYMS: Record<string, readonly string[]> = {
  writing: WRITING_SYNONYMS,
  write: WRITING_SYNONYMS,
  copy: ['writing', 'write', 'content', 'copywriting'],
  content: ['writing', 'write', 'copy'],
  grammar: ['writing', 'write'],
  image: ['art', 'generation', 'generate', 'generator', 'images', 'design'],
  art: ['image', 'generation', 'generate', 'generator', 'images', 'design'],
  code: ['coding', 'developer', 'development', 'copilot', 'programmer'],
  coding: ['code', 'developer', 'development', 'copilot', 'programmer'],
  video: ['film', 'podcast', 'recording'],
  voice: AUDIO_SYNONYMS,
  audio: AUDIO_SYNONYMS,
  speech: AUDIO_SYNONYMS,
  tts: AUDIO_SYNONYMS,
  music: MUSIC_SYNONYMS,
  chat: CHAT_SYNONYMS,
  chatbot: CHAT_SYNONYMS,
  assistant: CHAT_SYNONYMS,
  llm: CHAT_SYNONYMS,
  design: ['design', 'creative', 'image', 'art', 'canva'],
  research: ['analysis', 'document', 'knowledge', 'search'],
  notes: ['note', 'notebook', 'workspace', 'knowledge', 'notion'],
  note: ['notes', 'notebook', 'workspace', 'knowledge', 'notion'],
  agent: ['agents', 'autonomous', 'orchestration'],
  automate: ['automation', 'agent', 'agents', 'autonomous', 'workflow'],
  slides: ['presentation', 'deck', 'template', 'canva'],
  email: ['copy', 'copywriting', 'marketing'],
};

export const KNOWN_INTENT_TOKENS = new Set([
  'image', 'art', 'images',
  'code', 'coding',
  'chat', 'chatbot', 'assistant', 'llm',
  'write', 'writing', 'copy', 'content', 'grammar',
  'video', 'audio', 'voice', 'speech', 'tts', 'music',
  'design',
  'research',
  'notes', 'note',
  'agent', 'automate',
  'slides',
  'email',
]);

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
    .toLowerCase()
    .slice(0, SEARCH_QUERY_MAX);
}

export function tokenizeSearchQuery(input: string): string[] {
  const sanitized = sanitizeSearchQuery(input);
  if (!sanitized) return [];
  return sanitized.toLowerCase().split(' ').filter(Boolean);
}

export function expandSearchTerms(input: string): string[] {
  const sanitized = sanitizeSearchQuery(input);
  const terms = new Set<string>();
  let remaining = sanitized;

  for (const { phrase, terms: extras } of SEARCH_PHRASES) {
    if (remaining.includes(phrase)) {
      remaining = remaining.split(phrase).join(' ').replace(/\s+/g, ' ').trim();
      for (const synonym of extras) terms.add(synonym);
    }
  }

  const tokens = remaining.split(' ').filter(Boolean);
  for (const token of tokens) {
    terms.add(token);
    const synonyms = SEARCH_SYNONYMS[token];
    if (synonyms) {
      for (const synonym of synonyms) terms.add(synonym);
    }
  }
  return Array.from(terms);
}

function levenshtein(a: string, b: string): number {
  const rows = a.length;
  const cols = b.length;
  const prev = new Array(cols + 1);
  const next = new Array(cols + 1);
  for (let j = 0; j <= cols; j += 1) prev[j] = j;
  for (let i = 1; i <= rows; i += 1) {
    next[0] = i;
    for (let j = 1; j <= cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      next[j] = Math.min(prev[j] + 1, next[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= cols; j += 1) prev[j] = next[j];
  }
  return prev[cols];
}

export function editSimilarity(a: string, b: string): number {
  const left = (a || '').trim().toLowerCase();
  const right = (b || '').trim().toLowerCase();
  if (!left || !right) return 0;
  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length, 1);
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

function nameWords(tool: SearchableTool): string[] {
  return [
    tool.name || '',
    tool.slug || '',
    (tool.slug || '').replace(/-/g, ' '),
    ...(tool.name || '').split(/[^A-Za-z0-9]+/).filter((word) => word.length >= 3),
  ];
}

function nameWordScore(candidate: string, query: string): number {
  const trigram = trigramSimilarity(candidate, query);
  const edit = editSimilarity(candidate, query);
  if (edit >= TRIGRAM_MATCH_THRESHOLD && trigram >= 0.25) {
    return Math.max(edit, trigram);
  }
  return trigram;
}

function prefixOrWordScore(candidate: string, query: string): number {
  const needle = query.toLowerCase();
  const haystack = (candidate || '').toLowerCase();
  if (!needle || !haystack) return 0;

  let best = 0;
  if (haystack === needle) best = 1;
  else if (haystack.startsWith(needle)) best = 0.85;

  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  for (const word of words) {
    if (word === needle) best = Math.max(best, 1);
    else if (word.startsWith(needle)) best = Math.max(best, 0.85);
  }
  return best;
}

export function isShortSearchQuery(query: string): boolean {
  const length = sanitizeSearchQuery(query).length;
  return length > 0 && length <= SHORT_QUERY_MAX;
}

export function isKnownIntentQuery(rawQuery: string): boolean {
  return tokenizeSearchQuery(rawQuery).some((token) => KNOWN_INTENT_TOKENS.has(token));
}

function usesStrictNameMatch(query: string): boolean {
  return isShortSearchQuery(query) || isKnownIntentQuery(query);
}

function nameSimilarity(tool: SearchableTool, query: string): number {
  const scoreFn = usesStrictNameMatch(query) ? prefixOrWordScore : nameWordScore;
  return Math.max(0, ...nameWords(tool).map((candidate) => scoreFn(candidate, query)));
}

function hasExactFtsHit(tool: SearchableTool, rawQuery: string): boolean {
  const terms = tokenizeSearchQuery(rawQuery);
  if (terms.length === 0) return false;
  const haystacks = collectSearchText(tool);
  return terms.some((term) => haystacks.some((value) => includesTerm(value, term)));
}

function hasExpandedHit(tool: SearchableTool, rawQuery: string): boolean {
  const terms = expandSearchTerms(rawQuery);
  if (terms.length === 0) return false;
  const haystacks = collectSearchText(tool);
  return terms.some((term) => haystacks.some((value) => includesTerm(value, term)));
}

function categoryText(tool: SearchableTool): string {
  return (tool.tool_categories || [])
    .map((relation) => `${relation?.categories?.name || ''} ${relation?.categories?.slug || ''}`)
    .join(' ')
    .toLowerCase();
}

function queryHasToken(rawQuery: string, tokens: readonly string[]): boolean {
  return tokenizeSearchQuery(rawQuery).some((token) => tokens.includes(token));
}

function audioVoiceBoost(tool: SearchableTool, rawQuery: string): number {
  const terms = expandSearchTerms(rawQuery);
  if (!terms.some((term) => (AUDIO_SYNONYMS as readonly string[]).includes(term))) return 0;

  const name = (tool.name || '').toLowerCase();
  const tagline = (tool.tagline || '').toLowerCase();
  const tags = [...(tool.tags || []), ...(tool.features || [])].join(' ').toLowerCase();
  const haystack = `${name} ${tagline} ${tags}`;
  let boost = 0;
  if (/voice|speech|tts|audio|clon/.test(name)) boost += 4;
  if (/voice|speech|tts|audio|clon/.test(tagline) || /voice|speech|tts|audio|clon/.test(tags)) {
    boost += 3;
  }
  if (/text to speech/.test(haystack)) boost += 2;
  return boost;
}

function writingCopyBoost(tool: SearchableTool, rawQuery: string): number {
  const terms = expandSearchTerms(rawQuery);
  const writingIntent = ['writing', 'copy', 'content', 'grammar', 'copywriting', 'copywriter'];
  if (!terms.some((term) => writingIntent.includes(term))) return 0;

  const name = (tool.name || '').toLowerCase();
  const tagline = (tool.tagline || '').toLowerCase();
  const tags = [...(tool.tags || []), ...(tool.features || [])].join(' ').toLowerCase();
  const category = categoryText(tool);

  let boost = 0;
  if (/writing|copy|grammar|copywrit/.test(name)) boost += 4;
  if (/writing|copy|grammar|copywrit|content/.test(tagline) || /writing|copy|grammar|copywrit/.test(tags)) {
    boost += 2;
  }
  if (/content|writing|copy/.test(category)) boost += 1.2;
  return boost;
}

function imageArtBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['image', 'art', 'images'])) return 0;

  const name = (tool.name || '').toLowerCase();
  const tagline = (tool.tagline || '').toLowerCase();
  const tags = [...(tool.tags || []), ...(tool.features || [])].join(' ').toLowerCase();
  const category = categoryText(tool);

  let boost = 0;
  if (/image|art|midjourney|diffusion|dall|canva/.test(name)) boost += 4;
  if (/image|art/.test(tagline) || /image|art/.test(tags)) boost += 3;
  if (/design/.test(category)) boost += 2.2;
  return boost;
}

function codingBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['code', 'coding'])) return 0;

  const name = (tool.name || '').toLowerCase();
  const tagline = (tool.tagline || '').toLowerCase();
  const tags = [...(tool.tags || []), ...(tool.features || [])].join(' ').toLowerCase();
  const category = categoryText(tool);

  let boost = 0;
  if (/\bcopilot\b|\bcursor\b|\breplit\b|\bbolt\b|\bv0\b|\bcode\b/.test(name)) boost += 4;
  if (/code|coding|programmer|developer/.test(tagline) || /code|coding|programmer|developer/.test(tags)) {
    boost += 2;
  }
  if (/coding/.test(category)) boost += 2.5;
  return boost;
}

function isAiAssistantTool(tool: SearchableTool): boolean {
  return /chatgpt|claude|gemini/.test((tool.name || '').toLowerCase());
}

function chatBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['chat', 'chatbot', 'assistant', 'llm'])) return 0;

  const name = (tool.name || '').toLowerCase();
  const tagline = (tool.tagline || '').toLowerCase();
  const tags = [...(tool.tags || []), ...(tool.features || [])].join(' ').toLowerCase();

  let boost = 0;
  if (isAiAssistantTool(tool)) boost += 5;
  if (/chat/.test(name)) boost += 1.5;
  if (/\b(chat|chatbot|llm|conversation)\b/.test(tagline) || /\b(chat|chatbot|llm|conversation)\b/.test(tags)) {
    boost += 2;
  }
  return boost;
}

function videoBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['video'])) return 0;
  const haystack = `${tool.name || ''} ${tool.tagline || ''} ${(tool.features || []).join(' ')}`.toLowerCase();
  let boost = 0;
  if (/video|descript/.test((tool.name || '').toLowerCase())) boost += 4;
  if (/video|film|podcast|recording/.test(haystack)) boost += 3;
  return boost;
}

function designBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['design'])) return 0;
  const name = (tool.name || '').toLowerCase();
  const tagline = (tool.tagline || '').toLowerCase();
  const tags = [...(tool.tags || []), ...(tool.features || [])].join(' ').toLowerCase();
  const category = categoryText(tool);
  let boost = 0;
  if (/canva|midjourney|design/.test(name)) boost += 4;
  if (/design|creative/.test(tagline) || /design|creative/.test(tags)) boost += 2;
  if (/design/.test(category)) boost += 2.5;
  return boost;
}

function researchBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['research'])) return 0;
  const haystack = `${tool.name || ''} ${tool.tagline || ''} ${(tool.features || []).join(' ')}`.toLowerCase();
  let boost = 0;
  if (isAiAssistantTool(tool)) boost += 3;
  if (/analysis|research|document|knowledge|search/.test(haystack)) boost += 3;
  return boost;
}

function notesBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['notes', 'note'])) return 0;
  const haystack = `${tool.name || ''} ${tool.tagline || ''} ${(tool.features || []).join(' ')}`.toLowerCase();
  let boost = 0;
  if (/notion/.test((tool.name || '').toLowerCase())) boost += 5;
  if (/note|workspace|knowledge/.test(haystack)) boost += 3;
  return boost;
}

function agentAutomateBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['agent', 'automate'])) return 0;
  const name = (tool.name || '').toLowerCase();
  const haystack = `${name} ${tool.tagline || ''} ${(tool.features || []).join(' ')}`.toLowerCase();
  let boost = 0;
  if (/\bagent\b|autogpt|langchain/.test(name)) boost += 5;
  if (/agent|autonomous|orchestration|automation|workflow/.test(haystack)) boost += 2;
  return boost;
}

function slidesBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['slides'])) return 0;
  const name = (tool.name || '').toLowerCase();
  const haystack = `${name} ${tool.tagline || ''} ${(tool.features || []).join(' ')}`.toLowerCase();
  let boost = 0;
  if (/canva/.test(name)) boost += 5;
  if (/template|presentation|deck|design/.test(haystack)) boost += 2;
  return boost;
}

function emailBoost(tool: SearchableTool, rawQuery: string): number {
  if (!queryHasToken(rawQuery, ['email'])) return 0;
  const haystack = `${tool.name || ''} ${tool.tagline || ''} ${(tool.features || []).join(' ')}`.toLowerCase();
  let boost = 0;
  if (/copy\.ai|jasper/.test((tool.name || '').toLowerCase())) boost += 4;
  if (/email|copy|marketing/.test(haystack)) boost += 3;
  return boost;
}

function extraIntentBoost(tool: SearchableTool, rawQuery: string): number {
  return (
    videoBoost(tool, rawQuery)
    + designBoost(tool, rawQuery)
    + researchBoost(tool, rawQuery)
    + notesBoost(tool, rawQuery)
    + agentAutomateBoost(tool, rawQuery)
    + slidesBoost(tool, rawQuery)
    + emailBoost(tool, rawQuery)
  );
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

  const nameSim = nameSimilarity(tool, query);
  const exactFts = hasExactFtsHit(tool, query);
  const shortQuery = isShortSearchQuery(query);
  const knownIntent = isKnownIntentQuery(query);
  if (!shortQuery && !knownIntent && !exactFts && nameSim >= 0.4) {
    score += nameSim * 12;
  } else {
    score += nameSim;
  }
  score += writingCopyBoost(tool, query);
  score += audioVoiceBoost(tool, query);
  score += imageArtBoost(tool, query);
  score += codingBoost(tool, query);
  score += chatBoost(tool, query);
  score += extraIntentBoost(tool, query);
  score += trigramSimilarity(tagline, query) * (shortQuery || knownIntent ? 0.05 : 0.25);
  return score;
}

export function toolMatchesQuery(tool: SearchableTool, rawQuery: string): boolean {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query) return true;

  if (hasExpandedHit(tool, query)) return true;
  if (
    imageArtBoost(tool, query) > 0
    || codingBoost(tool, query) > 0
    || chatBoost(tool, query) > 0
    || extraIntentBoost(tool, query) > 0
  ) {
    return true;
  }
  if (queryHasToken(query, ['chat', 'chatbot', 'assistant', 'llm']) && isAiAssistantTool(tool)) {
    return true;
  }
  if (nameSimilarity(tool, query) >= TRIGRAM_MATCH_THRESHOLD) return true;
  return scoreTool(tool, query) >= SEARCH_MIN_SCORE;
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
    const allowTypoFirst = !usesStrictNameMatch(query);
    filtered.sort((left, right) => {
      const leftName = nameSimilarity(left, query);
      const rightName = nameSimilarity(right, query);
      const leftTypo = allowTypoFirst && !hasExactFtsHit(left, query) && leftName >= 0.4 ? leftName : 0;
      const rightTypo = allowTypoFirst && !hasExactFtsHit(right, query) && rightName >= 0.4 ? rightName : 0;
      if (rightTypo !== leftTypo) return rightTypo - leftTypo;
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
