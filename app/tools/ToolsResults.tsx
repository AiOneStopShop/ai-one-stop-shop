import { Fragment } from 'react';
import Link from 'next/link';
import { CompareCheckbox } from './CompareCheckbox';
import { HighlightedText } from '@/components/HighlightedText';
import { PaidVisitLink } from '@/components/PaidVisitLink';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import type { AffiliateGoMap } from '@/lib/affiliate-links';
import { toolHasAffiliate } from '@/lib/affiliate-links';

function buildToolsHref(query: string, category: string, price: string, free: boolean, exact = false, platform = 'all'): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (exact) params.set('exact', '1');
  if (platform !== 'all') params.set('platform', platform);
  if (category !== 'all') params.set('category', category);
  if (price !== 'all') params.set('price', price);
  if (free) params.set('free', '1');
  const next = params.toString();
  return next ? `/tools?${next}` : '/tools';
}

export function ToolsResults({
  tools,
  query,
  selectedCategory,
  priceFilter,
  hasFreeTier,
  didYouMean,
  correctedQuery = null,
  platform = 'all',
  activeFilterLabels = { category: '', price: '', platform: '' },
  popularCategories,
  affiliates = {},
}: {
  tools: any[];
  query: string;
  selectedCategory: string;
  priceFilter: string;
  hasFreeTier: boolean;
  didYouMean: { name: string } | null;
  correctedQuery?: string | null;
  platform?: string;
  activeFilterLabels?: { category: string; price: string; platform: string };
  popularCategories: Array<{ id: string; slug: string; name: string }>;
  affiliates?: AffiliateGoMap;
}) {
  const highlightQuery = correctedQuery || query;
  const correctionNote = correctedQuery ? (
    <p className="mb-6 text-soft" role="status">
      Showing results for <strong className="text-ink">{correctedQuery}</strong>.{' '}
      Search instead for{' '}
      <Link
        href={buildToolsHref(query, selectedCategory, priceFilter, hasFreeTier, true, platform)}
        className="text-green underline focus-ring rounded"
      >
        {query}
      </Link>
    </p>
  ) : null;

  if (tools.length > 0) {
    return (
      <>
      {correctionNote}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool: any, index: number) => {
          const primaryCategory = tool.tool_categories?.find((tc: any) => tc.is_primary)?.categories;

          return (
            <Fragment key={tool.id || tool.slug}>
              {'\n'}
              <article className="card group relative transition-shadow duration-200 hover:shadow-[0_14px_28px_-20px_rgba(30,59,44,0.55)]">
                <div className="absolute top-4 right-4 z-10">
                  <CompareCheckbox toolSlug={tool.slug} toolName={tool.name} />
                </div>

                <div className="flex flex-col h-full pr-24">
                  <h2 className="heading-3 mb-2">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group-hover:text-green transition-colors focus-ring rounded"
                    >
                      <HighlightedText text={tool.name} query={highlightQuery} />
                    </Link>
                  </h2>

                  {tool.tagline && (
                    <p className="text-soft mb-3 line-clamp-2">
                      <HighlightedText text={tool.tagline} query={highlightQuery} />
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {primaryCategory && (
                      <span className="badge-category text-xs">
                        {primaryCategory.name}
                      </span>
                    )}
                    {tool.has_free_tier && (
                      <span className="badge bg-leaf text-green border border-leaf-line text-xs">
                        Free tier
                      </span>
                    )}
                  </div>

                  {tool.pricing_summary && (
                    <p className="text-sm text-green font-medium mt-auto">
                      {tool.pricing_summary}
                    </p>
                  )}
                  <div className="mt-4">
                    <PaidVisitLink
                      slug={tool.slug}
                      name={tool.name}
                      paid={toolHasAffiliate(affiliates, tool.slug)}
                      goSlug={affiliates[tool.slug]}
                    />
                  </div>
                </div>
              </article>
              {index === 11 ? (
                <div className="md:col-span-2 lg:col-span-3">
                  <NewsletterSignup variant="compact" source="tools_list" />
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
      </>
    );
  }

  const removals = [
    selectedCategory !== 'all' && {
      key: 'category',
      label: `Category: ${activeFilterLabels.category || selectedCategory}`,
      href: buildToolsHref(query, 'all', priceFilter, hasFreeTier, false, platform),
    },
    priceFilter !== 'all' && {
      key: 'price',
      label: `Pricing: ${activeFilterLabels.price || priceFilter}`,
      href: buildToolsHref(query, selectedCategory, 'all', hasFreeTier, false, platform),
    },
    hasFreeTier && {
      key: 'free',
      label: 'Has a free tier',
      href: buildToolsHref(query, selectedCategory, priceFilter, false, false, platform),
    },
    platform !== 'all' && {
      key: 'platform',
      label: `Platform: ${activeFilterLabels.platform || platform}`,
      href: buildToolsHref(query, selectedCategory, priceFilter, hasFreeTier, false, 'all'),
    },
    query && (selectedCategory !== 'all' || priceFilter !== 'all' || hasFreeTier || platform !== 'all') && {
      key: 'all-filters',
      label: `All filters (keep “${query}”)`,
      href: buildToolsHref(query, 'all', 'all', false),
    },
  ].filter(Boolean) as Array<{ key: string; label: string; href: string }>;

  return (
    <div className="text-center py-12 max-w-xl mx-auto">
      <p className="text-ink text-lg font-medium mb-2">
        No tools match{query ? ` “${query}”` : ' those filters'}
      </p>
      {didYouMean ? (
        <p className="text-soft mb-6">
          Did you mean{' '}
          <Link
            href={buildToolsHref(didYouMean.name, selectedCategory, priceFilter, hasFreeTier, false, platform)}
            className="text-green hover:underline focus-ring rounded"
          >
            {didYouMean.name}
          </Link>
          ?
        </p>
      ) : (
        <p className="text-soft mb-6">
          Try a different word, or browse a popular category.
        </p>
      )}

      {removals.length > 0 ? (
        <div className="mb-8">
          <p className="text-sm font-medium text-ink mb-3">Try removing a filter</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {removals.map((removal) => (
              <li key={removal.key}>
                <Link href={removal.href} className="btn-secondary inline-flex items-center gap-1 min-h-11">
                  <span aria-hidden="true">×</span> {removal.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {popularCategories.length > 0 && (
        <div className="mb-8">
          <p className="text-sm font-medium text-ink mb-3">Popular categories</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {popularCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={buildToolsHref('', category.slug, 'all', false)}
                  className="badge-category focus-ring"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/tools" className="btn-secondary">
          Clear all filters
        </Link>
        <Link href="/submit" className="btn-primary">
          Submit a tool
        </Link>
      </div>
    </div>
  );
}
