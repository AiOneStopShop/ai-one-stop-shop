import { fallbackTools } from '@/lib/fallback-data';
import { sanitizeSearchQuery, searchTools } from '@/lib/search-tools';
import { supabase } from '@/lib/supabase';

export type CatalogSearchOptions = {
  q?: string;
  category?: string | null;
  price?: string | null;
  freeOnly?: boolean;
  limit?: number;
  offset?: number;
};

function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function attachCategories(rows: any[]): Promise<any[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id).filter(Boolean);
  if (ids.length === 0) return rows;

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

  return rows.map((row) => ({
    ...row,
    tool_categories: row.tool_categories || byTool.get(row.id) || [],
  }));
}

async function searchPublishedInMemory(options: CatalogSearchOptions) {
  const { data } = await supabase
    .from('tools')
    .select(`
      id,
      slug,
      name,
      tagline,
      description,
      website_url,
      pricing_summary,
      pricing_model,
      has_free_tier,
      platforms,
      features,
      logo_url,
      last_verified_at,
      is_sponsored,
      updated_at,
      status,
      tool_categories(
        is_primary,
        categories(id, slug, name, icon)
      )
    `)
    .eq('status', 'published');

  const source = (data && data.length > 0)
    ? data
    : fallbackTools.filter((tool) => tool.status === 'published');

  const matched = searchTools(source, {
    q: options.q,
    category: options.category || undefined,
    price: options.price || undefined,
    freeOnly: options.freeOnly,
    limit: options.limit,
    offset: options.offset,
  });

  const allMatched = searchTools(source, {
    q: options.q,
    category: options.category || undefined,
    price: options.price || undefined,
    freeOnly: options.freeOnly,
  });

  return {
    tools: matched,
    total: allMatched.length,
    publishedCount: source.length,
    suggestionPool: source,
  };
}

export async function searchPublishedCatalog(options: CatalogSearchOptions = {}) {
  const q = sanitizeSearchQuery(options.q);
  const category = options.category && options.category !== 'all' ? options.category : null;
  const price = options.price && options.price !== 'all' ? options.price : null;
  const freeOnly = Boolean(options.freeOnly);
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 50);
  const offset = Math.max(options.offset ?? 0, 0);

  if (supabaseConfigured()) {
    const { data, error } = await supabase.rpc('search_tools', {
      q,
      category,
      price,
      free_only: freeOnly,
      limit,
      offset,
    });

    if (!error && Array.isArray(data)) {
      const tools = await attachCategories(data);
      return {
        tools,
        total: data[0]?.result_total ?? data.length,
        publishedCount: data[0]?.result_total ?? data.length,
        suggestionPool: tools,
      };
    }
  }

  return searchPublishedInMemory({ q, category, price, freeOnly, limit, offset });
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
    .select('*')
    .order('sort_order');

  if (data && data.length > 0) return data;
  const { fallbackCategories } = await import('@/lib/fallback-data');
  return fallbackCategories;
}
