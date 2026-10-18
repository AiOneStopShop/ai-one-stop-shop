import { supabase } from '@/lib/supabase';

export type AffiliateGoMap = Record<string, string>;

function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getActiveAffiliateGoSlugs(): Promise<AffiliateGoMap> {
  if (!supabaseConfigured()) return {};

  const { data, error } = await supabase
    .from('affiliate_links')
    .select('go_slug, is_active, tools!inner(slug, status)')
    .eq('is_active', true)
    .eq('tools.status', 'published');

  if (error || !data) return {};

  const byToolSlug: AffiliateGoMap = {};
  for (const row of data) {
    const tool = Array.isArray(row.tools) ? row.tools[0] : row.tools;
    const toolSlug = tool?.slug;
    if (toolSlug && row.go_slug) {
      byToolSlug[toolSlug] = row.go_slug;
    }
  }
  return byToolSlug;
}

export function toolHasAffiliate(affiliates: AffiliateGoMap, toolSlug: string): boolean {
  return Boolean(affiliates[toolSlug]);
}

export function visitHref(affiliates: AffiliateGoMap, toolSlug: string): string {
  return `/go/${affiliates[toolSlug] || toolSlug}`;
}
