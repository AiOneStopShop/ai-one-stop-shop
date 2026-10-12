import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aionestop.shop';

  // Get all published tools
  const { data: tools } = await supabase
    .from('tools')
    .select('slug, updated_at, last_verified_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  // Get all categories with published tools only
  const { data: allCategories } = await supabase
    .from('categories')
    .select('slug, updated_at, id')
    .order('updated_at', { ascending: false });

  const { fallbackTools, fallbackToolCategories } = await import('@/lib/fallback-data');
  const categories = (allCategories || []).filter((cat: any) => {
    const toolIdsInCategory = fallbackToolCategories
      .filter((tc: any) => tc.category_id === cat.id)
      .map((tc: any) => tc.tool_id);
    
    return fallbackTools.some((tool: any) => 
      toolIdsInCategory.includes(tool.id) && tool.status === 'published'
    );
  });

  // Static pages
  const staticPages = [
    '',
    '/tools',
    '/our-kits',
    '/pricing',
    '/about',
    '/how-we-rank',
    '/disclosure',
    '/privacy',
    '/terms',
    '/submit',
    '/finder',
    '/compare',
    '/personas',
    '/personas/sarah',
    '/personas/fred',
    '/personas/claire',
    '/personas/steve',
    '/budget',
  ].map(route => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Tool pages
  const toolPages = (tools || []).map((tool: any) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: new Date(tool.last_verified_at || tool.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Category pages
  const categoryPages = (categories || []).map((cat: any) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...toolPages, ...categoryPages];
}
