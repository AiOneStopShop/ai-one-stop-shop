'use client';

import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { CompareCheckbox, CompareSelectedButton } from './CompareCheckbox';
import { ToolSearchForm } from '@/components/ToolSearchForm';
import { HighlightedText } from '@/components/HighlightedText';
import {
  SEARCH_DEBOUNCE_MS,
  searchTools,
  suggestDidYouMean,
} from '@/lib/search-tools';

type Tool = any;
type Category = any;

interface ToolsClientProps {
  initialTools: Tool[];
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
  initialPrice: string;
  initialFree: boolean;
}

function buildToolsHref(query: string, category: string, price: string, free: boolean): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category !== 'all') params.set('category', category);
  if (price !== 'all') params.set('price', price);
  if (free) params.set('free', '1');
  const next = params.toString();
  return next ? `/tools?${next}` : '/tools';
}

export function ToolsClient({
  initialTools,
  categories,
  initialQuery,
  initialCategory,
  initialPrice,
  initialFree,
}: ToolsClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceFilter, setPriceFilter] = useState(initialPrice);
  const [hasFreeTier, setHasFreeTier] = useState(initialFree);
  const [announcedCount, setAnnouncedCount] = useState<string>('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(draftQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draftQuery]);

  useEffect(() => {
    const next = buildToolsHref(searchQuery, selectedCategory, priceFilter, hasFreeTier);
    const current = `${pathname}${window.location.search}`;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [searchQuery, selectedCategory, priceFilter, hasFreeTier, pathname, router]);

  const filteredTools = useMemo(
    () =>
      searchTools(initialTools, {
        q: searchQuery,
        category: selectedCategory,
        price: priceFilter,
        freeOnly: hasFreeTier,
      }),
    [initialTools, searchQuery, selectedCategory, priceFilter, hasFreeTier]
  );

  const hasActiveFilters = Boolean(searchQuery) || selectedCategory !== 'all' || priceFilter !== 'all' || hasFreeTier;
  const didYouMean = useMemo(
    () => (filteredTools.length === 0 && searchQuery ? suggestDidYouMean(searchQuery, initialTools) : null),
    [filteredTools.length, searchQuery, initialTools]
  );

  const resultText = filteredTools.length === 0
    ? `No tools found matching your filters`
    : `Showing ${filteredTools.length} ${filteredTools.length === 1 ? 'tool' : 'tools'}${hasActiveFilters ? ` (filtered from ${initialTools.length})` : ''}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncedCount(resultText);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [resultText]);

  const clearFilters = () => {
    setDraftQuery('');
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceFilter('all');
    setHasFreeTier(false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitted = new FormData(event.currentTarget).get('q');
    const query = typeof submitted === 'string' ? submitted.trim() : '';
    setDraftQuery(query);
    setSearchQuery(query);
    router.push(buildToolsHref(query, selectedCategory, priceFilter, hasFreeTier));
  };

  const popularCategories = [...categories]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .slice(0, 4);

  return (
    <>
      <div className="mb-8 space-y-4">
        <ToolSearchForm
          id="tool-search"
          value={draftQuery}
          onQueryChange={setDraftQuery}
          onSearchSubmit={handleSearchSubmit}
        >
          {selectedCategory !== 'all' ? (
            <input type="hidden" name="category" value={selectedCategory} />
          ) : null}
          {priceFilter !== 'all' ? (
            <input type="hidden" name="price" value={priceFilter} />
          ) : null}
          {hasFreeTier ? <input type="hidden" name="free" value="1" /> : null}
        </ToolSearchForm>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-[#171C26] mb-2">
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-[#5B657B] rounded-lg focus-ring bg-white min-h-11"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price-filter" className="block text-sm font-medium text-[#171C26] mb-2">
              Pricing
            </label>
            <select
              id="price-filter"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 border border-[#5B657B] rounded-lg focus-ring bg-white min-h-11"
            >
              <option value="all">All pricing</option>
              <option value="free">Free</option>
              <option value="subscription">Subscription</option>
              <option value="one-time">One-time purchase</option>
              <option value="pay-per-use">Pay per use</option>
            </select>
          </div>

          <label className="flex items-center gap-2 px-4 py-2 border border-[#5B657B] rounded-lg cursor-pointer hover:bg-[#F9F8F5] transition-colors min-h-11">
            <input
              type="checkbox"
              checked={hasFreeTier}
              onChange={(e) => setHasFreeTier(e.target.checked)}
              className="w-6 h-6 text-[#6C39EF] focus-ring rounded border-[#5B657B]"
            />
            <span className="text-sm">Has free tier</span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-[#5B657B] hover:text-[#171C26] transition-colors focus-ring rounded-lg min-h-11"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className="text-sm text-[#5B657B]"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {announcedCount || resultText}
          </p>
          <CompareSelectedButton />
        </div>
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool: any) => {
            const primaryCategory = tool.tool_categories?.find((tc: any) => tc.is_primary)?.categories;

            return (
              <Fragment key={tool.id}>
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
                      <HighlightedText text={tool.name} query={searchQuery} />
                    </Link>
                  </h2>
                  {tool.is_sponsored && (
                    <span className="badge-sponsored text-xs mb-2">Sponsored</span>
                  )}

                  {tool.tagline && (
                    <p className="text-[#5B657B] mb-3 line-clamp-2">
                      <HighlightedText text={tool.tagline} query={searchQuery} />
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
                </div>
              </article>
              </Fragment>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 max-w-xl mx-auto">
          <p className="text-[#171C26] text-lg font-medium mb-2">
            No tools match{searchQuery ? ` “${searchQuery}”` : ' those filters'}
          </p>
          {didYouMean ? (
            <p className="text-[#5B657B] mb-6">
              Did you mean{' '}
              <Link
                href={buildToolsHref(didYouMean.name, selectedCategory, priceFilter, hasFreeTier)}
                className="text-[#6C39EF] hover:underline focus-ring rounded"
                onClick={() => {
                  setDraftQuery(didYouMean.name);
                  setSearchQuery(didYouMean.name);
                }}
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
                      onClick={() => {
                        setDraftQuery('');
                        setSearchQuery('');
                        setSelectedCategory(category.slug);
                        setPriceFilter('all');
                        setHasFreeTier(false);
                      }}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={clearFilters} className="btn-secondary">
              Clear all filters
            </button>
            <Link href="/submit" className="btn-primary">
              Submit a tool
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
