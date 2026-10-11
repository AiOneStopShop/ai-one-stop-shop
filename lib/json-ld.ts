import type { Tool, Category } from '@/types/database';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aionestop.shop';
const SITE_NAME = 'AI One Stop Shop';

/**
 * Safely serialize JSON-LD to prevent XSS attacks
 * Escapes <, >, &, and U+2028/U+2029 line/paragraph separators
 */
export function safeJsonLd(obj: any): string {
  const json = JSON.stringify(obj);
  
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description: 'Honest AI tools directory with curated tools and no fake ratings',
    founder: {
      '@type': 'Person',
      name: 'Kati Bartolec'
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'WA',
      addressCountry: 'US'
    },
    sameAs: [
      'https://onetomorrow.online'
    ]
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Honest AI tools directory',
    publisher: {
      '@id': `${SITE_URL}/#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/tools?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function generateToolSchema(tool: Tool, categories: Category[]) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description || tool.tagline,
    url: tool.website_url,
    applicationCategory: categories[0]?.name || 'Productivity',
    operatingSystem: tool.platforms.join(', ') || 'Web',
  };

  // Add offers if we have pricing
  if (tool.pricing_summary && tool.pricing_model !== 'contact') {
    schema.offers = {
      '@type': 'Offer',
      price: tool.has_free_tier ? '0' : undefined,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: tool.website_url,
    };
    
    // Add price validation date
    if (tool.last_verified_at) {
      schema.offers.priceValidUntil = tool.last_verified_at;
    }
  }

  return schema;
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`
    }))
  };
}

export function generateItemListSchema(
  name: string,
  description: string,
  items: Array<{ name: string; url: string; description?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
      description: item.description
    }))
  };
}
