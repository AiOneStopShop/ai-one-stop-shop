/**
 * Facet types, labels and the offline fallback for facet counts.
 * In production the counts come from public.search_tool_facets() (migration 028); the platform
 * grouping here mirrors public.search_platform_group() and is only used without a database.
 */
export const TOOL_SORTS = ['relevance', 'name', 'newest', 'verified', 'free'] as const;
export type ToolSort = (typeof TOOL_SORTS)[number];

export const TOOL_SORT_LABELS: Record<ToolSort, string> = {
  relevance: 'Best match',
  name: 'Name (A–Z)',
  newest: 'Newest in the directory',
  verified: 'Recently verified',
  free: 'Free tier first',
};

export function parseToolSort(value: string | null | undefined): ToolSort {
  return TOOL_SORTS.includes(value as ToolSort) ? (value as ToolSort) : 'relevance';
}

export const PLATFORM_GROUPS = [
  'web', 'desktop', 'mobile', 'api', 'cli', 'self-hosted', 'browser-extension', 'ide', 'integrations',
] as const;
export type PlatformGroup = (typeof PLATFORM_GROUPS)[number];

export const PLATFORM_LABELS: Record<PlatformGroup, string> = {
  web: 'Web',
  desktop: 'Desktop app',
  mobile: 'Mobile app',
  api: 'API / library',
  cli: 'Command line',
  'self-hosted': 'Self-hosted',
  'browser-extension': 'Browser extension',
  ide: 'Code editor / IDE',
  integrations: 'Works inside other apps',
};

export function parsePlatform(value: string | null | undefined): PlatformGroup | 'all' {
  return PLATFORM_GROUPS.includes(value as PlatformGroup) ? (value as PlatformGroup) : 'all';
}

export function platformGroup(raw: string | null | undefined): PlatformGroup | null {
  const p = (raw || '').trim().toLowerCase();
  if (!p) return null;
  if (['web', 'cloud'].includes(p)) return 'web';
  if (['desktop', 'macos', 'mac', 'windows', 'linux'].includes(p)) return 'desktop';
  if (['mobile', 'ios', 'android'].includes(p)) return 'mobile';
  if (['api', 'library', 'python', 'javascript'].includes(p)) return 'api';
  if (p === 'cli') return 'cli';
  if (p === 'self-hosted') return 'self-hosted';
  if (['chrome', 'chrome extension', 'browser extension'].includes(p)) return 'browser-extension';
  if (['ide', 'ide extension', 'editor extension', 'vs code', 'jetbrains', 'neovim'].includes(p)) return 'ide';
  return 'integrations';
}

export const PRICING_LABELS: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  subscription: 'Subscription',
  'one-time': 'One-time purchase',
  'pay-per-use': 'Pay per use',
  'usage-based': 'Usage-based',
  contact: 'Contact sales',
};

export type FacetOption = { value: string; label: string; count: number };
export type SearchFacets = {
  total: number;
  category: FacetOption[];
  pricing: FacetOption[];
  free: number;
  platform: FacetOption[];
};

export type FacetFilters = { category: string; price: string; free: boolean; platform: string };

type FacetTool = {
  pricing_model?: string | null;
  has_free_tier?: boolean | null;
  platforms?: string[] | null;
  tool_categories?: Array<{ categories?: { slug?: string | null; name?: string | null } | null } | null> | null;
};

/** Offline fallback: same disjunctive semantics as search_tool_facets(). */
export function computeFacets(
  tools: FacetTool[],
  filters: FacetFilters,
  categories: Array<{ slug: string; name: string }>,
): SearchFacets {
  const rows = tools.map((tool) => {
    const cats = (tool.tool_categories || []).map((tc) => tc?.categories?.slug).filter((s): s is string => Boolean(s));
    const plats = Array.from(new Set((tool.platforms || []).map(platformGroup).filter((g): g is PlatformGroup => Boolean(g))));
    return {
      cats,
      plats,
      pricing: tool.pricing_model || null,
      free: tool.has_free_tier === true,
      okCat: filters.category === 'all' || cats.includes(filters.category),
      okPrice: filters.price === 'all' || tool.pricing_model === filters.price,
      okFree: !filters.free || tool.has_free_tier === true,
      okPlat: filters.platform === 'all' || plats.includes(filters.platform as PlatformGroup),
    };
  });
  const pricingValues = Array.from(new Set(rows.map((r) => r.pricing).filter((p): p is string => Boolean(p))));
  return {
    total: rows.filter((r) => r.okCat && r.okPrice && r.okFree && r.okPlat).length,
    category: categories.map((c) => ({
      value: c.slug,
      label: c.name,
      count: rows.filter((r) => r.okPrice && r.okFree && r.okPlat && r.cats.includes(c.slug)).length,
    })),
    pricing: pricingValues.map((v) => ({
      value: v,
      label: PRICING_LABELS[v] || v,
      count: rows.filter((r) => r.okCat && r.okFree && r.okPlat && r.pricing === v).length,
    })),
    free: rows.filter((r) => r.okCat && r.okPrice && r.okPlat && r.free).length,
    platform: PLATFORM_GROUPS.map((g) => ({
      value: g,
      label: PLATFORM_LABELS[g],
      count: rows.filter((r) => r.okCat && r.okPrice && r.okFree && r.plats.includes(g)).length,
    })),
  };
}

export function facetsFromRows(rows: Array<{ facet: string; value: string; label: string; tool_count: number }>): SearchFacets {
  const pick = (facet: string) => rows
    .filter((r) => r.facet === facet)
    .map((r) => ({ value: r.value, label: r.label, count: Number(r.tool_count) || 0 }));
  return {
    total: Number(rows.find((r) => r.facet === 'total')?.tool_count ?? 0),
    category: pick('category'),
    pricing: pick('pricing'),
    free: Number(rows.find((r) => r.facet === 'free')?.tool_count ?? 0),
    platform: pick('platform'),
  };
}
