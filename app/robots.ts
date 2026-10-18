import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getSiteUrl, isCanonicalHost } from '@/lib/site-config';

const DISALLOW_ADMIN_AND_GO = ['/admin/', '/go/'];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host');
  if (!isCanonicalHost(host)) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...DISALLOW_ADMIN_AND_GO, '/api/admin/', '/account/'],
      },
      {
        userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'Googlebot', 'Bingbot'],
        allow: '/',
        disallow: DISALLOW_ADMIN_AND_GO,
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot'],
        allow: '/',
        disallow: DISALLOW_ADMIN_AND_GO,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
