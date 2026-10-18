/**
 * Search helpers shared by the app.
 *
 * Ranking lives in ONE place: the Postgres function public.search_tools() (migration 027),
 * which also does typo correction and synonym expansion from public.search_synonyms.
 * Everything here is either input normalization, highlighting, or a deliberately minimal
 * offline fallback used only when Supabase is unreachable (local dev without a database).
 */
import synonymSeed from './search-synonyms.seed.json';
import { normalizeCategorySlug } from '@/lib/taxonomy';

export const SEARCH_QUERY_MAX = 100;
export const SEARCH_DEBOUNCE_MS = 200;

// Same seed as public.search_synonyms; only the offline fallback and highlighting read it.
const SYNONYM_SEED = synonymSeed as Record<string, string[]>;

export const SEARCH_PHRASES: Array<{ phrase: string; terms: readonly string[] }> = Object.entries(SYNONYM_SEED)
  .filter(([term]) => term.includes(' '))
  .map(([phrase, terms]) => ({ phrase, terms }));

export const SEARCH_SYNONYMS: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(SYNONYM_SEED).filter(([term]) => !term.includes(' ')),
);

// Mirrors the filler-word list in search_tools().
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'to', 'for', 'from', 'of', 'and', 'or', 'with', 'in', 'on', 'by', 'my', 'me', 'i', 'your',
  'that', 'which', 'using', 'use', 'tool', 'tools', 'app', 'apps', 'software', 'ai', 'best', 'top', 'good',
  'make', 'makes', 'making', 'create', 'creating', 'build', 'help', 'helps', 'find', 'get', 'want', 'need',
  'something', 'can', 'is', 'are', 'into', 'like', 'some', 'new', 'online', 'platform', 'free',
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
    categories?: { name?: string | null; slug?: string | null; description?: string | null } | null;
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
  return input.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_').substring(0, SEARCH_QUERY_MAX);
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
  return sanitized ? sanitized.split(' ').filter(Boolean) : [];
}

/** Query words plus their synonyms (used for highlighting and the offline fallback). */
export function expandSearchTerms(input: string): string[] {
  let remaining = sanitizeSearchQuery(input);
  const terms = new Set<string>();
  for (const { phrase, terms: extras } of SEARCH_PHRASES) {
    if (remaining.includes(phrase)) {
      remaining = remaining.split(phrase).join(' ').replace(/\s+/g, ' ').trim();
      extras.forEach((term) => terms.add(term));
    }
  }
  for (const token of remaining.split(' ').filter(Boolean)) {
    terms.add(token);
    (SEARCH_SYNONYMS[token] || []).forEach((term) => terms.add(term));
  }
  return Array.from(terms);
}

/** Trigram (pg_trgm-style) similarity, used for "did you mean" in the offline fallback. */
export function trigramSimilarity(a: string, b: string): number {
  const grams = (value: string) => {
    const padded = `  ${value.toLowerCase()} `;
    const set = new Set<string>();
    for (let i = 0; i < padded.length - 2; i += 1) set.add(padded.slice(i, i + 3));
    return set;
  };
  const left = grams(a);
  const right = grams(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  left.forEach((gram) => { if (right.has(gram)) shared += 1; });
  return shared / (left.size + right.size - shared);
}

function categoryText(tool: SearchableTool): string {
  return (tool.tool_categories || [])
    .map((entry) => [entry?.categories?.name, entry?.categories?.slug].filter(Boolean).join(' '))
    .join(' ');
}

function matchesFilters(tool: SearchableTool, options: SearchToolsOptions): boolean {
  if (tool.status && tool.status !== 'published') return false;
  if (options.freeOnly && !tool.has_free_tier) return false;
  if (options.price && options.price !== 'all' && tool.pricing_model !== options.price) return false;
  const category = normalizeCategorySlug(options.category);
  if (category) {
    const slugs = (tool.tool_categories || [])
      .map((entry) => entry?.categories?.slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => normalizeCategorySlug(slug) || slug);
    if (!slugs.includes(category)) return false;
  }
  return true;
}

function wordMatch(haystack: string, term: string): boolean {
  return new RegExp(`\\b${escapeRegExp(term)}`, 'i').test(haystack);
}

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    let last = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
    }
  }
  return prev[b.length];
}

function toolText(tool: SearchableTool): string {
  return [tool.name, tool.tagline, tool.description, ...(tool.tags || []), categoryText(tool), ...(tool.features || [])]
    .filter(Boolean)
    .join(' ');
}

/** Same idea as search_correct_query(): fix words that match nothing, using catalog vocabulary. */
function correctWords(words: string[], pool: SearchableTool[]): string[] {
  const texts = pool.map(toolText);
  let vocab: string[] | null = null;
  return words.map((word) => {
    if (word.length < 4 || /\d/.test(word) || SEARCH_SYNONYMS[word] || texts.some((text) => wordMatch(text, word))) return word;
    vocab ??= Array.from(new Set(pool.flatMap((tool) => [tool.name, tool.tagline, ...(tool.tags || []), categoryText(tool)]
      .join(' ').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4))));
    const max = word.length <= 4 ? 1 : 2;
    const best = vocab
      .map((candidate) => ({ candidate, dist: levenshtein(candidate, word), sim: trigramSimilarity(candidate, word) }))
      .filter((c) => c.dist <= max && (c.sim >= 0.3 || c.candidate[0] === word[0]))
      .sort((x, y) => x.dist - y.dist || y.sim - x.sim)[0];
    return best?.candidate ?? word;
  });
}

/**
 * Minimal offline fallback (no database): typo-correct unknown words, then every meaningful word
 * or phrase (or a synonym) must match; name > tagline > tags/categories/features > description.
 */
export function searchTools<T extends SearchableTool>(tools: T[], options: SearchToolsOptions = {}): T[] {
  const query = sanitizeSearchQuery(options.q);
  const freeIntent = tokenizeSearchQuery(query).includes('free');
  const pool = tools.filter((tool) => matchesFilters(tool, { ...options, freeOnly: options.freeOnly || freeIntent }));

  let rest = query;
  const concepts: Array<{ term: string; synonyms: readonly string[] }> = [];
  for (const { phrase, terms } of SEARCH_PHRASES) {
    if (rest.includes(phrase)) {
      concepts.push({ term: phrase, synonyms: terms });
      rest = rest.split(phrase).join(' ');
    }
  }
  const words = correctWords(tokenizeSearchQuery(rest).filter((word) => !STOP_WORDS.has(word)), pool);
  words.forEach((word) => concepts.push({ term: word, synonyms: SEARCH_SYNONYMS[word] || [] }));

  const offset = Math.max(options.offset ?? 0, 0);
  if (concepts.length === 0) return pool.slice(offset, offset + (options.limit ?? pool.length));

  const effective = words.join(' ');
  const scored = pool.map((tool) => {
    const fields = [
      { text: tool.name || '', weight: 8 },
      { text: tool.tagline || '', weight: 5 },
      { text: [...(tool.tags || []), categoryText(tool), ...(tool.features || [])].join(' '), weight: 2 },
      { text: tool.description || '', weight: 1 },
    ];
    let score = 0;
    let matched = 0;
    for (const { term, synonyms } of concepts) {
      let best = 0;
      for (const field of fields) {
        if (wordMatch(field.text, term)) best = Math.max(best, field.weight);
        else if (synonyms.some((syn) => wordMatch(field.text, syn))) best = Math.max(best, field.weight * 0.6);
      }
      if (best > 0) matched += 1;
      score += best;
    }
    const name = (tool.name || '').toLowerCase();
    if (effective && name === effective) score += 30;
    else if (effective && name.startsWith(effective)) score += 12;
    return { tool, score, matched };
  });

  const need = scored.some((row) => row.matched === concepts.length) ? concepts.length : 1;
  const ranked = scored
    .filter((row) => row.matched >= need && row.score > 0)
    .sort((a, b) => b.score - a.score || (a.tool.name || '').localeCompare(b.tool.name || ''))
    .map((row) => row.tool);
  return ranked.slice(offset, offset + (options.limit ?? ranked.length));
}

export function toolMatchesQuery(tool: SearchableTool, rawQuery: string): boolean {
  return searchTools([tool], { q: rawQuery }).length > 0;
}

export function suggestDidYouMean<T extends SearchableTool>(rawQuery: string, tools: T[], threshold = 0.3): T | null {
  const query = sanitizeSearchQuery(rawQuery);
  if (query.length < 3) return null;
  let best: T | null = null;
  let bestScore = threshold;
  for (const tool of tools) {
    if (tool.status && tool.status !== 'published') continue;
    const candidates = [tool.name || '', ...(tool.name || '').split(/[^A-Za-z0-9]+/).filter((w) => w.length >= 3)];
    const score = Math.max(...candidates.map((candidate) => trigramSimilarity(candidate, query)));
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
    .filter((term) => term.length >= 2 && !STOP_WORDS.has(term))
    .sort((a, b) => b.length - a.length);
  if (!text || terms.length === 0) return text ? [{ text, match: false }] : [];
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig');
  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, match: terms.some((term) => part.toLowerCase() === term.toLowerCase()) }));
}
