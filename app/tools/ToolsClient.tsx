'use client';

import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { CompareSelectedButton } from './CompareCheckbox';
import { ToolSearchForm } from '@/components/ToolSearchForm';
import { SEARCH_DEBOUNCE_MS } from '@/lib/search-tools';
import { TOOL_SORTS, TOOL_SORT_LABELS, type SearchFacets } from '@/lib/search-facets';
import { FacetPanel, type FacetState } from './FacetPanel';

type Category = any;

function buildToolsHref(
  query: string,
  category: string,
  price: string,
  free: boolean,
  sort = 'relevance',
  exact = false,
  platform = 'all',
): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (query && exact) params.set('exact', '1');
  if (category !== 'all') params.set('category', category);
  if (price !== 'all') params.set('price', price);
  if (free) params.set('free', '1');
  if (platform !== 'all') params.set('platform', platform);
  if (sort !== 'relevance') params.set('sort', sort);
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
  initialSort = 'relevance',
  initialExact = false,
  initialPlatform = 'all',
  facets = null,
  children,
}: {
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
  initialPrice: string;
  initialFree: boolean;
  resultCount: number;
  publishedCount: number;
  initialSort?: string;
  initialExact?: boolean;
  initialPlatform?: string;
  facets?: SearchFacets | null;
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
  const [sort, setSort] = useState(initialSort);
  const [platform, setPlatform] = useState(initialPlatform);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [announcedCount, setAnnouncedCount] = useState('');

  useEffect(() => {
    setDraftQuery(initialQuery);
    setSearchQuery(initialQuery);
    setSelectedCategory(initialCategory);
    setPriceFilter(initialPrice);
    setHasFreeTier(initialFree);
    setSort(initialSort);
    setPlatform(initialPlatform);
  }, [initialQuery, initialCategory, initialPrice, initialFree, initialSort, initialPlatform]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(draftQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draftQuery]);

  useEffect(() => {
    // Keep ?exact=1 ("Search instead for ...") only while the query is unchanged.
    const next = buildToolsHref(searchQuery, selectedCategory, priceFilter, hasFreeTier, sort, initialExact && searchQuery === initialQuery, platform);
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
    // Soft navigation: the server re-renders results and facet counts without a full reload.
    startTransition(() => {
      if (mode === 'push') {
        router.push(next, { scroll: false });
      } else {
        router.replace(next, { scroll: false });
      }
    });
  }, [searchQuery, selectedCategory, priceFilter, hasFreeTier, sort, platform, pathname, router, initialExact, initialQuery]);

  // Privacy-safe analytics: once a query has settled, send only its text and result count.
  const loggedQueries = useRef(new Set<string>());
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2 || loggedQueries.current.has(q)) return undefined;
    const timer = window.setTimeout(() => {
      loggedQueries.current.add(q);
      const payload = JSON.stringify({ q, count: resultCount });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/search/log', new Blob([payload], { type: 'application/json' }));
        } else {
          void fetch('/api/search/log', { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } });
        }
      } catch {
        /* logging is best effort */
      }
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [searchQuery, resultCount]);

  const activeFilterCount = [selectedCategory !== 'all', priceFilter !== 'all', hasFreeTier, platform !== 'all'].filter(Boolean).length;
  const hasActiveFilters = Boolean(searchQuery) || activeFilterCount > 0;
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
    setPlatform('all');
    setSort('relevance');
  };

  // Facet changes push a history entry so Back undoes them one at a time.
  const applyFacets = (next: Partial<FacetState>) => {
    historyMode.current = 'push';
    if (next.category !== undefined) setSelectedCategory(next.category);
    if (next.price !== undefined) setPriceFilter(next.price);
    if (next.free !== undefined) setHasFreeTier(next.free);
    if (next.platform !== undefined) setPlatform(next.platform);
  };
  const facetState: FacetState = { category: selectedCategory, price: priceFilter, free: hasFreeTier, platform };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitted = new FormData(event.currentTarget).get('q');
    const query = typeof submitted === 'string' ? submitted.trim() : '';
    const next = buildToolsHref(query, selectedCategory, priceFilter, hasFreeTier, sort, false, platform);
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
          {platform !== 'all' ? <input type="hidden" name="platform" value={platform} /> : null}
        </ToolSearchForm>

        <div className="flex flex-wrap items-end gap-3">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 lg:hidden min-h-11"
            aria-haspopup="dialog"
            onClick={() => dialogRef.current?.showModal()}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </button>
          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium text-ink mb-2">
              Sort by
            </label>
            <select
              id="sort-filter"
              value={sort}
              onChange={(e) => { historyMode.current = 'push'; setSort(e.target.value); }}
              className="px-4 py-2 border border-soft rounded-lg focus-ring bg-white min-h-11"
            >
              {TOOL_SORTS.map((value) => (
                <option key={value} value={value}>{TOOL_SORT_LABELS[value]}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-soft hover:text-ink transition-colors focus-ring rounded-lg min-h-11"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className="text-sm text-soft"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {announcedCount || resultText}
          </p>
          <CompareSelectedButton />
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="filters-title"
        className="m-0 ml-auto h-full max-h-full w-full max-w-sm overflow-y-auto bg-white p-0 backdrop:bg-black/40"
        onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="filters-title" className="heading-3 m-0">Filters</h2>
          <button type="button" className="rounded p-2 focus-ring" aria-label="Close filters" onClick={() => dialogRef.current?.close()}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-4 py-4">
          <FacetPanel idPrefix="m" facets={facets} categories={categories} state={facetState} onChange={applyFacets} />
        </div>
        <div className="sticky bottom-0 flex gap-2 border-t border-line bg-white px-4 py-3">
          {activeFilterCount ? (
            <button type="button" className="btn-secondary flex-1" onClick={clearFilters}>Clear</button>
          ) : null}
          <button type="button" className="btn-primary flex-1" onClick={() => dialogRef.current?.close()}>
            Show {facets ? facets.total : resultCount} {(facets ? facets.total : resultCount) === 1 ? 'tool' : 'tools'}
          </button>
        </div>
      </dialog>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Filters" className="hidden lg:block">
          <FacetPanel idPrefix="d" facets={facets} categories={categories} state={facetState} onChange={applyFacets} />
        </aside>
        <div aria-busy={isPending} className={isPending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {children}
        </div>
      </div>
    </>
  );
}
