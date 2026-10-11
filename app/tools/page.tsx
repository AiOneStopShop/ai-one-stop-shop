import Link from 'next/link';
import { generateItemListSchema, generateBreadcrumbSchema, safeJsonLd } from '@/lib/json-ld';
import { getCategories, getPublishedSuggestionPool, searchPublishedCatalog } from '@/lib/search-catalog';
import { sanitizeSearchQuery, suggestDidYouMean } from '@/lib/search-tools';
import { ToolsClient } from './ToolsClient';
import { ToolsResults } from './ToolsResults';
import { StickyCompareButton } from './CompareCheckbox';

export const metadata = {
  title: 'AI Tools Directory - All Tools',
  description: 'Browse our complete directory of AI tools. Each tool includes what it does, who it\'s for, and real pricing.',
  alternates: { canonical: '/tools' },
};

export default async function ToolsPage(props: {
  searchParams: Promise<{ q?: string; category?: string; price?: string; free?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = sanitizeSearchQuery(searchParams.q);
  const category = searchParams.category || 'all';
  const price = searchParams.price || 'all';
  const free = searchParams.free === '1';

  const [catalog, categories, publishedPool] = await Promise.all([
    searchPublishedCatalog({
      q: query,
      category,
      price,
      freeOnly: free,
    }),
    getCategories(),
    getPublishedSuggestionPool(),
  ]);

  const didYouMean = catalog.tools.length === 0 && query
    ? suggestDidYouMean(query, publishedPool)
    : null;
  const popularCategories = [...categories]
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .slice(0, 4);

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
              <p className="text-lead">
                {publishedPool.length} curated tools. No fake ratings.
              </p>
            </div>

            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-[#171C26]">
                Some links are paid links. They never change our ranking.{' '}
                <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
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
              resultCount={catalog.tools.length}
              publishedCount={publishedPool.length}
            >
              <ToolsResults
                tools={catalog.tools}
                query={query}
                selectedCategory={category}
                priceFilter={price}
                hasFreeTier={free}
                didYouMean={didYouMean}
                popularCategories={popularCategories}
              />
            </ToolsClient>

            <div className="mt-16 bg-[#F3EFFF] border border-[#6C39EF] rounded-2xl p-8 text-center">
              <h2 className="heading-2 mb-4">Can't find a tool?</h2>
              <p className="text-lead mb-6">Suggest a tool for us to review</p>
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
