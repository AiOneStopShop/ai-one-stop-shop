import type { Tool, Category } from '@/types/database';
import { getBrandUrl, getSiteUrl, SITE_NAME } from '@/lib/site-config';

const SITE_URL = getSiteUrl();

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
  const brandUrl = getBrandUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description: 'Honest AI tools directory with curated tools and no fake ratings',
    founder: {
      '@type': 'Organization',
      name: 'oneTomorrow',
      ...(brandUrl ? { url: brandUrl } : {}),
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'WA',
      addressCountry: 'US'
    },
    ...(brandUrl ? { sameAs: [brandUrl] } : {}),
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

export function generatePersonaPageSchema(persona: {
  slug: string;
  name: string;
  title: string;
  whoFor: string;
  jobs: string[];
}, tools: Array<{ name: string; slug: string; tagline?: string | null }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${persona.name}: ${persona.title}`,
    description: persona.whoFor,
    url: `${SITE_URL}/personas/${persona.slug}`,
    about: {
      '@type': 'Intangible',
      name: persona.title,
      description: persona.whoFor,
    },
    mainEntity: generateItemListSchema(
      `${persona.name}'s starter toolkit`,
      persona.jobs.join(' '),
      tools.map((tool) => ({
        name: tool.name,
        url: `/tools/${tool.slug}`,
        description: tool.tagline || undefined,
      }))
    ),
  };
}

export function generateFaqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** CollectionPage for a guide, with dateModified = newest last-checked price date among its picks. */
export function generateGuidePageSchema(guide: {
  slug: string;
  title: string;
  description: string;
  dateModified?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: guide.title,
    description: guide.description,
    url: `${SITE_URL}/guides/${guide.slug}`,
    ...(guide.dateModified ? { dateModified: guide.dateModified } : {}),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}
