import Link from 'next/link';
import { CatalogPager } from '@/components/CatalogPager';
import { generateItemListSchema, generateBreadcrumbSchema, safeJsonLd } from '@/lib/json-ld';
import { getActiveAffiliateGoSlugs } from '@/lib/affiliate-links';
import { getCategories, getPublishedSuggestionPool, searchPublishedCatalog } from '@/lib/search-catalog';
import { sanitizeSearchQuery, suggestDidYouMean } from '@/lib/search-tools';
import { CATALOG_PAGE_SIZE, parseCategorySort, parsePage } from '@/lib/taxonomy';
import { ToolsClient } from './ToolsClient';
import { ToolsResults } from './ToolsResults';
import { StickyCompareButton } from './CompareCheckbox';

export const metadata = {
  title: 'AI Tools Directory - All Tools',
  description: 'Browse our complete directory of AI tools. Each tool includes what it does, who it\'s for, and real pricing.',
  alternates: { canonical: '/tools' },
};

export default async function ToolsPage(props: {
  searchParams: Promise<{ q?: string; category?: string; price?: string; free?: string; page?: string; sort?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = sanitizeSearchQuery(searchParams.q);
  const category = searchParams.category || 'all';
  const price = searchParams.price || 'all';
  const free = searchParams.free === '1';
  const page = parsePage(searchParams.page);
  const sort = parseCategorySort(searchParams.sort);

  const [catalog, categories, publishedPool, affiliates] = await Promise.all([
    searchPublishedCatalog({
      q: query,
      category,
      price,
      freeOnly: free,
      sort,
      limit: CATALOG_PAGE_SIZE,
      offset: (page - 1) * CATALOG_PAGE_SIZE,
    }),
    getCategories(),
    getPublishedSuggestionPool(),
    getActiveAffiliateGoSlugs(),
  ]);

  const suggested = catalog.tools.length === 0 && query
    ? suggestDidYouMean(query, publishedPool)
    : null;
  const didYouMean = suggested?.name ? { name: suggested.name } : null;
  const popularCategories = [...categories]
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .slice(0, 8);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' }
  ]);

  const itemList = generateItemListSchema(
    'AI Tools Directory',
    'Browse AI tools with pricing and feature details',
    catalog.tools.map((tool: any) => ({
      name: tool.name,
      url: `/tools/${tool.slug}`,
      description: tool.tagline || ''
    }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }}
      />

      <div className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max">
            <div className="mb-8">
              <h1 className="heading-1 mb-4">All AI Tools</h1>
              <p className="text-xl text-ink leading-relaxed">
                {publishedPool.length} curated tools. No fake ratings.
              </p>
            </div>

            <div className="mb-8 p-6 bg-card border border-line rounded-2xl">
              <p className="text-sm text-ink">
                Some links are paid links. They never change our ranking.{' '}
                <Link href="/disclosure" className="text-green hover:underline focus-ring rounded">
                  How we make money
                </Link>
              </p>
            </div>

            <ToolsClient
              categories={categories}
              initialQuery={query}
              initialCategory={category}
              initialPrice={price}
              initialFree={free}
              resultCount={catalog.total}
              publishedCount={publishedPool.length}
              initialSort={sort}
            >
              <ToolsResults
                tools={catalog.tools}
                query={query}
                selectedCategory={category}
                priceFilter={price}
                hasFreeTier={free}
                didYouMean={didYouMean}
                popularCategories={popularCategories}
                affiliates={affiliates}
              />
            </ToolsClient>

            <CatalogPager
              page={page}
              total={catalog.total}
              hrefForPage={(nextPage) => {
                const params = new URLSearchParams();
                if (query) params.set('q', query);
                if (category !== 'all') params.set('category', category);
                if (price !== 'all') params.set('price', price);
                if (free) params.set('free', '1');
                if (sort !== 'relevance') params.set('sort', sort);
                if (nextPage > 1) params.set('page', String(nextPage));
                const qs = params.toString();
                return qs ? `/tools?${qs}` : '/tools';
              }}
            />

            <div className="mt-16 bg-card border-2 border-green rounded-2xl p-8 text-center">
              <h2 className="heading-2 mb-4">Can't find a tool?</h2>
              <p className="text-xl text-ink mb-6">Suggest a tool for us to review</p>
              <Link href="/submit" className="btn-primary">
                Submit a tool
              </Link>
            </div>
          </div>
        </section>
        <StickyCompareButton />
      </div>
    </>
  );
}
