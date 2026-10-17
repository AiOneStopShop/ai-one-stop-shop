import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { TAXONOMY } from '@/lib/taxonomy';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aionestop.shop';

  const { data: tools } = await supabase
    .from('tools')
    .select('slug, updated_at, last_verified_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  const { data: liveCategories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .order('sort_order');

  const categories = (liveCategories && liveCategories.length > 0)
    ? liveCategories
    : TAXONOMY.map((category) => ({ slug: category.slug, updated_at: new Date().toISOString() }));

  const staticPages = [
    '',
    '/tools',
    '/categories',
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
    '/advertise',
    '/advertise/request',
    '/sponsor-terms',
    '/partners',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const toolPages = (tools || []).map((tool: any) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: new Date(tool.last_verified_at || tool.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const categoryPages = categories.map((cat: any) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: new Date(cat.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...toolPages, ...categoryPages];
}
