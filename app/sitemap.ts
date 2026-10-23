import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { buildSitemap, safeRows, sitemapBaseUrl, type SitemapCategoryRow, type SitemapToolRow } from '@/lib/sitemap';

// Regenerate hourly so tools published after the last deploy are listed.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Each query fails soft: on error/throw/timeout we still return the static pages
  // (and the built-in category list) instead of a 500.
  const [tools, categories] = await Promise.all([
    safeRows<SitemapToolRow>('tools', () =>
      supabase
        .from('tools')
        .select('slug, updated_at, last_verified_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
    ),
    safeRows<SitemapCategoryRow>('categories', () =>
      supabase.from('categories').select('slug, updated_at').order('sort_order')
    ),
  ]);

  return buildSitemap({ baseUrl: sitemapBaseUrl(), tools, categories });
}
