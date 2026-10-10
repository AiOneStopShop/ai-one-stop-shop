'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { CompareCheckbox } from './CompareCheckbox';

type Tool = any;
type Category = any;

interface ToolsClientProps {
  initialTools: Tool[];
  categories: Category[];
}

export function ToolsClient({ initialTools, categories }: ToolsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [hasFreeTier, setHasFreeTier] = useState(false);

  // Filter tools based on search and filters
  const filteredTools = useMemo(() => {
    return initialTools.filter(tool => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          tool.name.toLowerCase().includes(query) ||
          (tool.tagline && tool.tagline.toLowerCase().includes(query)) ||
          (tool.description && tool.description.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const toolCategories = (tool as any).tool_categories || [];
        const hasCategory = toolCategories.some((tc: any) => 
          tc.categories?.slug === selectedCategory
        );
        if (!hasCategory) return false;
      }

      // Free tier filter
      if (hasFreeTier && !tool.has_free_tier) {
        return false;
      }

      // Price filter
      if (priceFilter !== 'all') {
        if (priceFilter === 'free' && tool.pricing_model !== 'free') return false;
        if (priceFilter === 'subscription' && tool.pricing_model !== 'subscription') return false;
        if (priceFilter === 'one-time' && tool.pricing_model !== 'one-time') return false;
      }

      return true;
    });
  }, [initialTools, searchQuery, selectedCategory, priceFilter, hasFreeTier]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceFilter !== 'all' || hasFreeTier;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceFilter('all');
    setHasFreeTier(false);
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5B657B]" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search tools by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[#E5E1DC] rounded-lg focus-ring"
            aria-label="Search AI tools"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="sr-only">Filter by category</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-[#E5E1DC] rounded-lg focus-ring bg-white"
            >
              <option value="all">All categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Model Filter */}
          <div>
            <label htmlFor="price-filter" className="sr-only">Filter by pricing model</label>
            <select
              id="price-filter"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 border border-[#E5E1DC] rounded-lg focus-ring bg-white"
            >
              <option value="all">All pricing</option>
              <option value="free">Free</option>
              <option value="subscription">Subscription</option>
              <option value="one-time">One-time purchase</option>
            </select>
          </div>

          {/* Free Tier Checkbox */}
          <label className="flex items-center gap-2 px-4 py-2 border border-[#E5E1DC] rounded-lg cursor-pointer hover:bg-[#F9F8F5] transition-colors">
            <input
              type="checkbox"
              checked={hasFreeTier}
              onChange={(e) => setHasFreeTier(e.target.checked)}
              className="w-4 h-4 text-[#6C39EF] focus-ring rounded"
              aria-label="Filter tools with free tier"
            />
            <span className="text-sm">Has free tier</span>
          </label>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-[#5B657B] hover:text-[#171C26] transition-colors focus-ring rounded-lg"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-[#5B657B]">
          Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
          {hasActiveFilters && ` (filtered from ${initialTools.length})`}
        </p>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool: any) => {
            const primaryCategory = tool.tool_categories?.find((tc: any) => tc.is_primary)?.categories;
            
            return (
              <article key={tool.id} className="card group relative">
                <div className="absolute top-4 right-4 z-10">
                  <CompareCheckbox toolSlug={tool.slug} />
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
                        {primaryCategory.icon} {primaryCategory.name}
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

                  <div className="mt-3 pt-3 border-t border-[#E6E8EC]">
                    <CompareCheckbox toolSlug={tool.slug} />
                  </div>
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
