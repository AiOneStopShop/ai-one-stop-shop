import { MetadataRoute } from 'next';

const DISALLOW_ADMIN_AND_GO = ['/admin/', '/go/'];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aionestop.shop';

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
