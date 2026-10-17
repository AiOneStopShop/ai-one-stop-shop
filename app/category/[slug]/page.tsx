import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CatalogPager } from '@/components/CatalogPager';
import { PaidVisitLink } from '@/components/PaidVisitLink';
import { getActiveAffiliateGoSlugs, toolHasAffiliate } from '@/lib/affiliate-links';
import { generateItemListSchema, generateBreadcrumbSchema, safeJsonLd } from '@/lib/json-ld';
import { getCategoryBySlug, listPublishedTools, searchPublishedCatalog } from '@/lib/search-catalog';
import { applyFallbackTaxonomy, taxonomyFallbackCategories } from '@/lib/taxonomy-fallback';
import { fallbackTools } from '@/lib/fallback-data';
import {
  CATALOG_PAGE_SIZE,
  CATEGORY_ALIASES,
  parseCategorySort,
  parsePage,
} from '@/lib/taxonomy';

export const revalidate = 3600;

function hrefFor(slug: string, page: number, sort: string, free: boolean, price: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (sort !== 'relevance') params.set('sort', sort);
  if (free) params.set('free', '1');
  if (price && price !== 'all') params.set('price', price);
  const qs = params.toString();
  return qs ? `/category/${slug}?${qs}` : `/category/${slug}`;
}

export async function generateStaticParams() {
  const categories = taxonomyFallbackCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `Best ${category.name} AI Tools`,
    description: category.description || `Discover AI tools for ${category.name.toLowerCase()}`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; free?: string; price?: string }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const alias = CATEGORY_ALIASES[slug];
  if (alias && alias !== slug) {
    redirect(`/category/${alias}`);
  }

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = parsePage(searchParams.page);
  const sort = parseCategorySort(searchParams.sort);
  const free = searchParams.free === '1';
  const price = searchParams.price && searchParams.price !== 'all' ? searchParams.price : '';

  let listed = await listPublishedTools({
    category: category.slug,
    freeOnly: free,
    price: price || null,
    sort,
    limit: CATALOG_PAGE_SIZE,
    offset: (page - 1) * CATALOG_PAGE_SIZE,
  });

  if (!listed || listed.total === 0) {
    const fallback = searchPublishedCatalog({
      category: category.slug,
      freeOnly: free,
      price: price || null,
      sort,
      limit: CATALOG_PAGE_SIZE,
      offset: (page - 1) * CATALOG_PAGE_SIZE,
    });
    listed = await fallback;
    if (listed.total === 0) {
      const local = fallbackTools
        .filter((tool) => tool.status === 'published')
        .map(applyFallbackTaxonomy)
        .filter((tool) => (tool.tool_categories || []).some((rel: any) => rel.categories?.slug === category.slug));
      listed = {
        tools: local.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE),
        total: local.length,
        publishedCount: local.length,
        suggestionPool: [],
      };
    }
  }

  const affiliates = await getActiveAffiliateGoSlugs();
  const showRanks = sort === 'relevance' && listed.tools.some((tool: any) => tool.editorial_score != null);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: category.name, url: `/category/${category.slug}` },
  ]);

  const itemList = generateItemListSchema(
    `Best ${category.name} AI Tools`,
    category.description || '',
    listed.tools.map((tool: any) => ({
      name: tool.name,
      url: `/tools/${tool.slug}`,
      description: tool.tagline || '',
    }))
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      <div className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link href="/" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">Home</Link>
                </li>
                <li aria-hidden="true" className="text-[#5B657B]">/</li>
                <li>
                  <Link href="/categories" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">Categories</Link>
                </li>
                <li aria-hidden="true" className="text-[#5B657B]">/</li>
                <li aria-current="page" className="text-[#171C26] font-medium">{category.name}</li>
              </ol>
            </nav>

            <div className="mb-8">
              <h1 className="heading-1 mb-4">
                {category.icon ? <span aria-hidden="true">{category.icon} </span> : null}
                Best {category.name} AI Tools
              </h1>
              {category.description && <p className="text-lead">{category.description}</p>}
              <p className="text-[#5B657B] mt-2">
                {listed.total} {listed.total === 1 ? 'tool' : 'tools'}
              </p>
            </div>

            <form method="get" className="card mb-8 grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="sort" className="block text-sm font-medium mb-2">Sort</label>
                <select id="sort" name="sort" defaultValue={sort} className="w-full px-3 py-2 border border-[#5B657B] rounded-lg focus-ring bg-white min-h-11">
                  <option value="relevance">Relevance</option>
                  <option value="free">Free first</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-2">Pricing</label>
                <select id="price" name="price" defaultValue={price || 'all'} className="w-full px-3 py-2 border border-[#5B657B] rounded-lg focus-ring bg-white min-h-11">
                  <option value="all">All pricing</option>
                  <option value="free">Free</option>
                  <option value="subscription">Subscription</option>
                  <option value="pay-per-use">Pay per use</option>
                </select>
              </div>
              <label className="flex items-center gap-3 min-h-11 md:mt-7">
                <input type="checkbox" name="free" value="1" defaultChecked={free} />
                Free tier
              </label>
              <button type="submit" className="btn-primary md:col-span-3 w-fit">Apply filters</button>
            </form>

            {listed.tools.length > 0 ? (
              <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
                {listed.tools.map((tool: any, index: number) => (
                  <li key={tool.id || tool.slug} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {showRanks && (
                          <span className="text-[#6C39EF] font-bold" aria-hidden="true">
                            #{(page - 1) * CATALOG_PAGE_SIZE + index + 1}
                          </span>
                        )}
                        <h2 className="heading-3">
                          <Link href={`/tools/${tool.slug}`} className="hover:text-[#6C39EF] focus-ring rounded">
                            {tool.name}
                          </Link>
                        </h2>
                      </div>
                      {tool.has_free_tier && (
                        <span className="badge bg-green-50 text-green-700 border border-green-200 text-xs">Free</span>
                      )}
                    </div>
                    {tool.tagline && <p className="text-[#5B657B] mb-3 line-clamp-2">{tool.tagline}</p>}
                    {tool.pricing_summary && (
                      <p className="text-sm font-medium text-[#171C26] mb-4">{tool.pricing_summary}</p>
                    )}
                    <div className="space-y-3">
                      <PaidVisitLink
                        slug={tool.slug}
                        name={tool.name}
                        paid={toolHasAffiliate(affiliates, tool.slug)}
                        goSlug={affiliates[tool.slug]}
                      />
                      <Link href={`/tools/${tool.slug}`} className="btn-secondary w-full">View details</Link>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-center py-12 bg-[#F9F8F5] rounded-xl">
                <p className="text-lg text-[#5B657B] mb-4">No tools in this category match those filters.</p>
                <Link href="/tools" className="text-[#6C39EF] hover:underline focus-ring rounded">Browse all tools</Link>
              </div>
            )}

            <CatalogPager
              page={page}
              total={listed.total}
              hrefForPage={(nextPage) => hrefFor(category.slug, nextPage, sort, free, price)}
            />

            <div className="mt-16 bg-[#F3EFFF] border border-[#6C39EF] rounded-xl p-8">
              <h2 className="heading-2 mb-4">How we chose these tools</h2>
              <p className="text-lg mb-4">
                We review each tool&apos;s public pricing and features. A tool can appear in more than one category.
              </p>
              <Link href="/how-we-rank" className="text-[#6C39EF] font-medium hover:underline focus-ring rounded">
                Read our full ranking method →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
