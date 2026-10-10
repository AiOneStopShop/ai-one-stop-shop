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

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false });

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
  ].map(route => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Tool pages
  const toolPages = (tools || []).map(tool => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: new Date(tool.last_verified_at || tool.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Category pages
  const categoryPages = (categories || []).map(cat => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...toolPages, ...categoryPages];
}
