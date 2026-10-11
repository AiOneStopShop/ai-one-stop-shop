'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { CompareCheckbox, CompareSelectedButton } from './CompareCheckbox';

type Tool = any;
type Category = any;

interface ToolsClientProps {
  initialTools: Tool[];
  categories: Category[];
}

export function ToolsClient({ initialTools, categories }: ToolsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceFilter, setPriceFilter] = useState(searchParams.get('price') || 'all');
  const [hasFreeTier, setHasFreeTier] = useState(searchParams.get('free') === '1');
  const [announcedCount, setAnnouncedCount] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (priceFilter !== 'all') params.set('price', priceFilter);
    if (hasFreeTier) params.set('free', '1');
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [searchQuery, selectedCategory, priceFilter, hasFreeTier, pathname, router, searchParams]);

  const filteredTools = useMemo(() => {
    return initialTools.filter(tool => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          tool.name.toLowerCase().includes(query) ||
          (tool.tagline && tool.tagline.toLowerCase().includes(query)) ||
          (tool.description && tool.description.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      if (selectedCategory !== 'all') {
        const toolCategories = tool.tool_categories || [];
        const hasCategory = toolCategories.some((tc: any) =>
          tc.categories?.slug === selectedCategory
        );
        if (!hasCategory) return false;
      }

      if (hasFreeTier && !tool.has_free_tier) {
        return false;
      }

      if (priceFilter !== 'all') {
        if (priceFilter === 'free' && tool.pricing_model !== 'free') return false;
        if (priceFilter === 'subscription' && tool.pricing_model !== 'subscription') return false;
        if (priceFilter === 'one-time' && tool.pricing_model !== 'one-time') return false;
      }

      return true;
    });
  }, [initialTools, searchQuery, selectedCategory, priceFilter, hasFreeTier]);

  const hasActiveFilters = Boolean(searchQuery) || selectedCategory !== 'all' || priceFilter !== 'all' || hasFreeTier;

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
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceFilter('all');
    setHasFreeTier(false);
  };

  return (
    <>
      <div className="mb-8 space-y-4">
        <div>
          <label htmlFor="tool-search" className="block text-sm font-medium text-[#171C26] mb-2">
            Search tools
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5B657B]" aria-hidden="true" />
            <input
              id="tool-search"
              type="search"
              placeholder="Search tools by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#5B657B] rounded-lg focus-ring bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-[#171C26] mb-2">
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-[#5B657B] rounded-lg focus-ring bg-white"
            >
              <option value="all">All categories</option>
              {categories.map(cat => (
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
              className="px-4 py-2 border border-[#5B657B] rounded-lg focus-ring bg-white"
            >
              <option value="all">All pricing</option>
              <option value="free">Free</option>
              <option value="subscription">Subscription</option>
              <option value="one-time">One-time purchase</option>
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
              <article key={tool.id} className="card group relative">
                <div className="absolute top-4 right-4 z-10">
                  <CompareCheckbox toolSlug={tool.slug} toolName={tool.name} />
                </div>

                <div className="flex flex-col h-full pr-24">
                  <h2 className="heading-3 mb-2">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group-hover:text-[#6C39EF] transition-colors focus-ring rounded"
                    >
                      {tool.name}
                    </Link>
                  </h2>
                  {tool.is_sponsored && (
                    <span className="badge-sponsored text-xs mb-2">Sponsored</span>
                  )}

                  {tool.tagline && (
                    <p className="text-[#5B657B] mb-3 line-clamp-2">{tool.tagline}</p>
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
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#5B657B] mb-4">
            No tools found matching your filters
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-secondary"
          >
            Clear all filters
          </button>
        </div>
      )}
    </>
  );
}

