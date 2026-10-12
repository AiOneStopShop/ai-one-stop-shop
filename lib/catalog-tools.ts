import { fallbackTools } from '@/lib/fallback-data';
import { supabase } from '@/lib/supabase';

export type CatalogTool = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  website_url: string;
  pricing_summary: string | null;
  pricing_model: string | null;
  has_free_tier: boolean;
  features: string[];
  last_verified_at: string | null;
  is_sponsored: boolean;
  tool_categories?: Array<{
    is_primary?: boolean;
    categories?: { slug?: string; name?: string } | null;
  }>;
};

const CATALOG_FIELDS = `
  id,
  slug,
  name,
  tagline,
  description,
  website_url,
  pricing_summary,
  pricing_model,
  has_free_tier,
  features,
  last_verified_at,
  is_sponsored,
  status,
  tool_categories(
    is_primary,
    categories(slug, name)
  )
`;

const CATALOG_CAP = 2000;

function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function categorySlugsOf(tool: CatalogTool): string[] {
  const slugs = new Set<string>();
  for (const relation of tool.tool_categories || []) {
    if (relation?.categories?.slug) slugs.add(relation.categories.slug);
  }
  return Array.from(slugs);
}

export function primaryCategorySlug(tool: CatalogTool): string | null {
  const primary = (tool.tool_categories || []).find((relation) => relation?.is_primary);
  return primary?.categories?.slug || tool.tool_categories?.[0]?.categories?.slug || null;
}

export function publishedFallbackTools(): CatalogTool[] {
  return fallbackTools.filter((tool) => tool.status === 'published') as CatalogTool[];
}

export async function getPublishedCatalogTools(): Promise<CatalogTool[]> {
  if (supabaseConfigured()) {
    const { data, error } = await supabase
      .from('tools')
      .select(CATALOG_FIELDS)
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(CATALOG_CAP);

    if (!error && data && data.length > 0) {
      return data as CatalogTool[];
    }
  }

  return publishedFallbackTools();
}
