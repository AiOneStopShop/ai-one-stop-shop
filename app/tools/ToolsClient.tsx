'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { CompareSelectedButton } from './CompareCheckbox';
import { ToolSearchForm } from '@/components/ToolSearchForm';
import { SEARCH_DEBOUNCE_MS } from '@/lib/search-tools';

type Category = any;

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
  categories,
  initialQuery,
  initialCategory,
  initialPrice,
  initialFree,
  resultCount,
  publishedCount,
  children,
}: {
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
  initialPrice: string;
  initialFree: boolean;
  resultCount: number;
  publishedCount: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const historyMode = useRef<'replace' | 'push'>('replace');

  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceFilter, setPriceFilter] = useState(initialPrice);
  const [hasFreeTier, setHasFreeTier] = useState(initialFree);
  const [announcedCount, setAnnouncedCount] = useState('');

  useEffect(() => {
    setDraftQuery(initialQuery);
    setSearchQuery(initialQuery);
    setSelectedCategory(initialCategory);
    setPriceFilter(initialPrice);
    setHasFreeTier(initialFree);
  }, [initialQuery, initialCategory, initialPrice, initialFree]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(draftQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draftQuery]);

  useEffect(() => {
    const next = buildToolsHref(searchQuery, selectedCategory, priceFilter, hasFreeTier);
    const current = `${pathname}${window.location.search}`;
    if (next === current) {
      if (historyMode.current === 'push') {
        window.history.pushState(window.history.state ?? {}, '', current);
      }
      historyMode.current = 'replace';
      return;
    }
    const leavingUnfilteredTools = current === '/tools' && next !== '/tools';
    const mode = leavingUnfilteredTools ? 'push' : historyMode.current;
    historyMode.current = 'replace';
    if (mode === 'push') {
      router.push(next, { scroll: false });
    } else {
      router.replace(next, { scroll: false });
    }
  }, [searchQuery, selectedCategory, priceFilter, hasFreeTier, pathname, router]);

  const hasActiveFilters = Boolean(searchQuery) || selectedCategory !== 'all' || priceFilter !== 'all' || hasFreeTier;
  const resultText = resultCount === 0
    ? 'No tools found matching your filters'
    : `Showing ${resultCount} ${resultCount === 1 ? 'tool' : 'tools'}${hasActiveFilters ? ` (filtered from ${publishedCount})` : ''}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncedCount(resultText);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [resultText]);

  const clearFilters = () => {
    historyMode.current = 'push';
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
    const next = buildToolsHref(query, selectedCategory, priceFilter, hasFreeTier);
    const current = `${pathname}${typeof window !== 'undefined' ? window.location.search : ''}`;
    if (next === current) {
      window.history.pushState(window.history.state ?? {}, '', current);
      historyMode.current = 'replace';
    } else {
      historyMode.current = 'push';
    }
    setDraftQuery(query);
    setSearchQuery(query);
  };

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
              {categories.map((cat: any) => (
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

      {children}
    </>
  );
}
