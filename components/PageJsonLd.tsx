import { generateBreadcrumbSchema, safeJsonLd } from '@/lib/json-ld';
import { getSiteUrl, SITE_NAME } from '@/lib/site-config';

type PageType = 'WebPage' | 'AboutPage' | 'WebApplication';

/**
 * Structured data for static pages: a typed page node tied to our
 * WebSite/Organization ids, plus a Home > Page breadcrumb.
 */
export function PageJsonLd({
  path,
  name,
  description,
  type = 'WebPage',
}: {
  path: string;
  name: string;
  description: string;
  type?: PageType;
}) {
  const siteUrl = getSiteUrl();
  const page: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${siteUrl}${path}#webpage`,
    url: `${siteUrl}${path}`,
    name,
    description,
    isPartOf: { '@id': `${siteUrl}/#website` },
    publisher: { '@id': `${siteUrl}/#organization` },
    inLanguage: 'en-US',
  };
  if (type === 'WebApplication') {
    page.applicationCategory = 'UtilitiesApplication';
    page.operatingSystem = 'Web';
    page.offers = { '@type': 'Offer', price: '0', priceCurrency: 'USD' };
    page.provider = { '@id': `${siteUrl}/#organization` };
    delete page.publisher;
  }
  const breadcrumbs = generateBreadcrumbSchema([
    { name: SITE_NAME, url: '/' },
    { name, url: path },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(page) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
    </>
  );
}
