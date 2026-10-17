import { Fragment } from 'react';
import Link from 'next/link';
import { CompareCheckbox } from './CompareCheckbox';
import { HighlightedText } from '@/components/HighlightedText';
import { PaidVisitLink } from '@/components/PaidVisitLink';
import type { AffiliateGoMap } from '@/lib/affiliate-links';
import { toolHasAffiliate } from '@/lib/affiliate-links';

function buildToolsHref(query: string, category: string, price: string, free: boolean): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
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
  popularCategories,
  affiliates = {},
}: {
  tools: any[];
  query: string;
  selectedCategory: string;
  priceFilter: string;
  hasFreeTier: boolean;
  didYouMean: { name: string } | null;
  popularCategories: Array<{ id: string; slug: string; name: string }>;
  affiliates?: AffiliateGoMap;
}) {
  if (tools.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool: any) => {
          const primaryCategory = tool.tool_categories?.find((tc: any) => tc.is_primary)?.categories;

          return (
            <Fragment key={tool.id || tool.slug}>
              {'\n'}
              <article className="card group relative">
                <div className="absolute top-4 right-4 z-10">
                  <CompareCheckbox toolSlug={tool.slug} toolName={tool.name} />
                </div>

                <div className="flex flex-col h-full pr-24">
                  <h2 className="heading-3 mb-2">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group-hover:text-[#6C39EF] transition-colors focus-ring rounded"
                    >
                      <HighlightedText text={tool.name} query={query} />
                    </Link>
                  </h2>
                  {tool.is_sponsored && (
                    <span className="badge-sponsored text-xs mb-2">Sponsored ad</span>
                  )}

                  {tool.tagline && (
                    <p className="text-[#5B657B] mb-3 line-clamp-2">
                      <HighlightedText text={tool.tagline} query={query} />
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {primaryCategory && (
                      <span className="badge-category text-xs">
                        {primaryCategory.icon ? (
                          <span aria-hidden="true">{primaryCategory.icon} </span>
                        ) : null}
                        {primaryCategory.name}
                      </span>
                    )}
                    {tool.has_free_tier && (
                      <span className="badge bg-green-50 text-green-700 border border-green-200 text-xs">
                        Free tier
                      </span>
                    )}
                  </div>

                  {tool.pricing_summary && (
                    <p className="text-sm text-[#6C39EF] font-medium mt-auto">
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
            </Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-center py-12 max-w-xl mx-auto">
      <p className="text-[#171C26] text-lg font-medium mb-2">
        No tools match{query ? ` “${query}”` : ' those filters'}
      </p>
      {didYouMean ? (
        <p className="text-[#5B657B] mb-6">
          Did you mean{' '}
          <Link
            href={buildToolsHref(didYouMean.name, selectedCategory, priceFilter, hasFreeTier)}
            className="text-[#6C39EF] hover:underline focus-ring rounded"
          >
            {didYouMean.name}
          </Link>
          ?
        </p>
      ) : (
        <p className="text-[#5B657B] mb-6">
          Try a different word, or browse a popular category.
        </p>
      )}

      {popularCategories.length > 0 && (
        <div className="mb-8">
          <p className="text-sm font-medium text-[#171C26] mb-3">Popular categories</p>
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
