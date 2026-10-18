import { fallbackTools } from '@/lib/fallback-data';
import { sanitizeSearchQuery, searchTools } from '@/lib/search-tools';
import { supabase } from '@/lib/supabase';
import { applyFallbackTaxonomy, taxonomyFallbackCategories } from '@/lib/taxonomy-fallback';
import {
  CATALOG_PAGE_SIZE,
  normalizeCategorySlug,
  type CategorySort,
} from '@/lib/taxonomy';

export const TOOL_LIST_COLUMNS = [
  'id',
  'slug',
  'name',
  'tagline',
  'pricing_summary',
  'pricing_model',
  'has_free_tier',
  'last_verified_at',
  'updated_at',
  'editorial_score',
  'is_sponsored',
  'tags',
  'logo_url',
  'status',
].join(', ');

export type CatalogSearchOptions = {
  q?: string;
  /** Skip database typo correction ("Search instead for ..."). */
  exact?: boolean;
  category?: string | null;
  price?: string | null;
  freeOnly?: boolean;
  sort?: CategorySort;
  limit?: number;
  offset?: number;
};

function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function toListTool(tool: any) {
  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline ?? null,
    pricing_summary: tool.pricing_summary ?? null,
    pricing_model: tool.pricing_model ?? null,
    has_free_tier: Boolean(tool.has_free_tier),
    last_verified_at: tool.last_verified_at ?? null,
    updated_at: tool.updated_at ?? null,
    editorial_score: tool.editorial_score ?? null,
    is_sponsored: Boolean(tool.is_sponsored),
    tags: tool.tags || [],
    logo_url: tool.logo_url ?? null,
    status: tool.status,
    tool_categories: tool.tool_categories || [],
  };
}

export async function attachCategories(rows: any[]): Promise<any[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id).filter(Boolean);
  if (ids.length === 0) return rows.map(toListTool);

  const { data } = await supabase
    .from('tool_categories')
    .select('tool_id, is_primary, categories(id, slug, name, icon)')
    .in('tool_id', ids);

  const byTool = new Map<string, any[]>();
  for (const relation of data || []) {
    const list = byTool.get(relation.tool_id) || [];
    list.push(relation);
    byTool.set(relation.tool_id, list);
  }

  return rows.map((row) => toListTool({
    ...row,
    tool_categories: row.tool_categories || byTool.get(row.id) || [],
  }));
}

function sortTools(tools: any[], sort: CategorySort | undefined) {
  const copy = [...tools];
  if (sort === 'free') {
    copy.sort((a, b) => Number(Boolean(b.has_free_tier)) - Number(Boolean(a.has_free_tier)) || a.name.localeCompare(b.name));
  } else if (sort === 'newest') {
    copy.sort((a, b) => {
      const aDate = new Date(a.last_verified_at || a.updated_at || 0).getTime();
      const bDate = new Date(b.last_verified_at || b.updated_at || 0).getTime();
      return bDate - aDate || a.name.localeCompare(b.name);
    });
  } else {
    copy.sort((a, b) => (b.editorial_score ?? -1) - (a.editorial_score ?? -1) || a.name.localeCompare(b.name));
  }
  return copy;
}

async function searchPublishedInMemory(options: CatalogSearchOptions) {
  const { data } = await supabase
    .from('tools')
    .select(`${TOOL_LIST_COLUMNS}, tool_categories(is_primary, categories(id, slug, name, icon))`)
    .eq('status', 'published');

  const source = (data && data.length > 0)
    ? data
    : fallbackTools.filter((tool) => tool.status === 'published').map(applyFallbackTaxonomy);

  const matched = searchTools(source, {
    q: options.q,
    category: options.category || undefined,
    price: options.price || undefined,
    freeOnly: options.freeOnly,
  });
  const sorted = options.q ? matched : sortTools(matched, options.sort);
  const offset = Math.max(options.offset ?? 0, 0);
  const limit = Math.min(Math.max(options.limit ?? CATALOG_PAGE_SIZE, 1), 50);

  return {
    tools: sorted.slice(offset, offset + limit).map(toListTool),
    total: sorted.length,
    publishedCount: source.length,
    suggestionPool: source.map((tool: any) => ({ id: tool.id, slug: tool.slug, name: tool.name, tagline: tool.tagline })),
  };
}

export async function searchPublishedCatalog(options: CatalogSearchOptions = {}) {
  const q = sanitizeSearchQuery(options.q);
  const category = normalizeCategorySlug(options.category);
  const price = options.price && options.price !== 'all' ? options.price : null;
  const freeOnly = Boolean(options.freeOnly);
  const limit = Math.min(Math.max(options.limit ?? CATALOG_PAGE_SIZE, 1), 50);
  const offset = Math.max(options.offset ?? 0, 0);
  const sort = options.sort || 'relevance';

  if (!q && supabaseConfigured()) {
    const listed = await listPublishedTools({ category, price, freeOnly, sort, limit, offset });
    if (listed) return listed;
  }

  if (q && supabaseConfigured()) {
    const { data, error } = await supabase.rpc('search_tools', {
      q,
      category,
      price,
      free_only: freeOnly,
      limit,
      offset,
      ...(options.exact ? { exact: true } : {}),
    });

    if (!error && Array.isArray(data)) {
      const tools = await attachCategories(data);
      return {
        tools,
        total: data[0]?.result_total ?? data.length,
        publishedCount: data[0]?.result_total ?? data.length,
        suggestionPool: tools,
        correctedQuery: (typeof data[0]?.corrected_query === 'string' && data[0].corrected_query) || null,
      };
    }
  }

  return searchPublishedInMemory({ q, category, price, freeOnly, sort, limit, offset });
}

export async function listPublishedTools(options: {
  category?: string | null;
  price?: string | null;
  freeOnly?: boolean;
  sort?: CategorySort;
  limit?: number;
  offset?: number;
}) {
  const category = normalizeCategorySlug(options.category);
  const limit = Math.min(Math.max(options.limit ?? CATALOG_PAGE_SIZE, 1), 50);
  const offset = Math.max(options.offset ?? 0, 0);

  const categoryRow = category ? await getCategoryBySlug(category) : null;
  const join = categoryRow
    ? `${TOOL_LIST_COLUMNS}, tool_categories!inner(is_primary, category_id, categories(id, slug, name, icon))`
    : `${TOOL_LIST_COLUMNS}, tool_categories(is_primary, category_id, categories(id, slug, name, icon))`;

  let query = supabase
    .from('tools')
    .select(join, { count: 'exact' })
    .eq('status', 'published');

  if (categoryRow) {
    query = query.eq('tool_categories.category_id', categoryRow.id);
  }
  if (options.freeOnly) query = query.eq('has_free_tier', true);
  if (options.price) query = query.eq('pricing_model', options.price);

  if (options.sort === 'newest') {
    query = query.order('last_verified_at', { ascending: false, nullsFirst: false }).order('updated_at', { ascending: false });
  } else if (options.sort === 'free') {
    query = query.order('has_free_tier', { ascending: false }).order('name');
  } else {
    query = query.order('editorial_score', { ascending: false, nullsFirst: false }).order('name');
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error || !data) return null;

  return {
    tools: data.map(toListTool),
    total: count ?? data.length,
    publishedCount: count ?? data.length,
    suggestionPool: data.map((tool: any) => ({ id: tool.id, slug: tool.slug, name: tool.name, tagline: tool.tagline })),
  };
}

export async function getPublishedSuggestionPool() {
  const { data } = await supabase
    .from('tools')
    .select('id, slug, name, status, tagline')
    .eq('status', 'published');

  if (data && data.length > 0) return data;
  return fallbackTools.filter((tool) => tool.status === 'published');
}

export async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon, sort_order')
    .order('sort_order');

  if (data && data.length > 0) return data;
  return taxonomyFallbackCategories();
}

export async function getCategoryBySlug(slug: string) {
  const normalized = normalizeCategorySlug(slug) || slug;
  const { data } = await supabase
    .from('categories')
    .select('id, slug, name, description, icon, sort_order')
    .eq('slug', normalized)
    .maybeSingle();

  if (data) return data;
  return taxonomyFallbackCategories().find((category) => category.slug === normalized) || null;
}
