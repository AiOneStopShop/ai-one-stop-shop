import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { isAffiliateLive } from '@/lib/site-config';
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
  searchParams: Promise<{ q?: string; category?: string; price?: string; free?: string; page?: string; sort?: string; exact?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = sanitizeSearchQuery(searchParams.q);
  const category = searchParams.category || 'all';
  const price = searchParams.price || 'all';
  const free = searchParams.free === '1';
  const page = parsePage(searchParams.page);
  const sort = parseCategorySort(searchParams.sort);
  const exact = searchParams.exact === '1';

  const [catalog, categories, publishedPool, affiliates] = await Promise.all([
    searchPublishedCatalog({
      q: query,
      exact,
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
  const correctedQuery = 'correctedQuery' in catalog && typeof catalog.correctedQuery === 'string' && catalog.correctedQuery !== query
    ? catalog.correctedQuery
    : null;
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
        <PageIntro
          title="All AI tools"
          accent="magnifier"
          lead={<>{publishedPool.length} curated tools. No fake ratings. Real prices, with the date we checked them.</>}
        />
        <section className="py-10 md:py-12">
          <div className="container-max">
            <div className="note mb-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="text-ink m-0">
                {isAffiliateLive()
                  ? 'Some links are paid links. They never change our ranking.'
                  : 'No tool can pay to rank higher here. Sponsored spots are labeled and kept separate.'}{' '}
                <Link href="/disclosure" className="text-green underline focus-ring rounded">
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
              initialExact={exact}
            >
              <ToolsResults
                tools={catalog.tools}
                query={query}
                selectedCategory={category}
                priceFilter={price}
                hasFreeTier={free}
                didYouMean={didYouMean}
                correctedQuery={correctedQuery}
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
                if (query && exact) params.set('exact', '1');
                if (category !== 'all') params.set('category', category);
                if (price !== 'all') params.set('price', price);
                if (free) params.set('free', '1');
                if (sort !== 'relevance') params.set('sort', sort);
                if (nextPage > 1) params.set('page', String(nextPage));
                const qs = params.toString();
                return qs ? `/tools?${qs}` : '/tools';
              }}
            />

            <div className="mt-16 panel-honest text-center">
              <h2 className="heading-2 mb-4">Can't find a tool?</h2>
              <p className="text-xl mb-6">Suggest a tool for us to review</p>
              <Link href="/submit" className="btn-light">
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
