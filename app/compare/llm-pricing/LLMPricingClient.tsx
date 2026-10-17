'use client';

import { useState, useMemo } from 'react';
import type { LLMPricing } from '@/types/database';

interface Props {
  pricing: LLMPricing[];
}

type SortKey = 'name' | 'provider' | 'category' | 'input_price_per_1m' | 'output_price_per_1m' | 'monthly_price';
type SortOrder = 'asc' | 'desc';

const CATEGORY_LABELS: Record<string, string> = {
  'api-model': 'API Model',
  'consumer-plan': 'Consumer Plan',
  'agent-service': 'Coding Agent',
  'local': 'Local/Open-Source'
};

export function LLMPricingClient({ pricing }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculator state
  const [inputTokens, setInputTokens] = useState<number>(1000000);
  const [outputTokens, setOutputTokens] = useState<number>(1000000);

  const providers = useMemo(() => {
    const unique = new Set(pricing.map(p => p.provider));
    return Array.from(unique).sort();
  }, [pricing]);

  const categories = useMemo(() => {
    const unique = new Set(pricing.map(p => p.category));
    return Array.from(unique).sort();
  }, [pricing]);

  const filteredAndSorted = useMemo(() => {
    let result = pricing;

    // Apply filters
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (providerFilter !== 'all') {
      result = result.filter(p => p.provider === providerFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.provider.toLowerCase().includes(query) ||
        p.notes?.toLowerCase().includes(query)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Handle null values
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [pricing, categoryFilter, providerFilter, searchQuery, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'See provider';
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return '—';
    return num.toLocaleString();
  };

  const calculateMonthlyCost = (item: LLMPricing) => {
    if (item.category !== 'api-model' || !item.input_price_per_1m || !item.output_price_per_1m) {
      return null;
    }

    const inputCost = (inputTokens / 1000000) * item.input_price_per_1m;
    const outputCost = (outputTokens / 1000000) * item.output_price_per_1m;
    return inputCost + outputCost;
  };

  return (
    <>
      {/* Filters and Search */}
      <div className="bg-[#F9F8F5] border border-[#E5E1DC] rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#171C26] mb-4">Filter & Search</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-[#171C26] mb-2">
              Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E1DC] rounded-md focus:ring-2 focus:ring-[#6C39EF] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="provider-filter" className="block text-sm font-medium text-[#171C26] mb-2">
              Provider
            </label>
            <select
              id="provider-filter"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E1DC] rounded-md focus:ring-2 focus:ring-[#6C39EF] focus:border-transparent"
            >
              <option value="all">All Providers</option>
              {providers.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-[#171C26] mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or provider..."
              className="w-full px-3 py-2 border border-[#E5E1DC] rounded-md focus:ring-2 focus:ring-[#6C39EF] focus:border-transparent"
            />
          </div>
        </div>

        {(categoryFilter !== 'all' || providerFilter !== 'all' || searchQuery) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setCategoryFilter('all');
                setProviderFilter('all');
                setSearchQuery('');
              }}
              className="text-sm text-[#6C39EF] hover:underline focus-ring rounded"
            >
              Clear all filters
            </button>
            <span className="ml-4 text-sm text-[#5B657B]">
              Showing {filteredAndSorted.length} of {pricing.length} items
            </span>
          </div>
        )}
      </div>

      {/* Monthly Cost Calculator */}
      {categoryFilter === 'all' || categoryFilter === 'api-model' ? (
        <div className="bg-[#F0EDFF] border border-[#C7BDFF] rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#171C26] mb-4">Monthly Cost Calculator</h2>
          <p className="text-sm text-[#5B657B] mb-4">
            Estimate your monthly API costs based on token usage. Enter your expected monthly input and output tokens.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div>
              <label htmlFor="input-tokens" className="block text-sm font-medium text-[#171C26] mb-2">
                Input Tokens per Month
              </label>
              <input
                type="number"
                id="input-tokens"
                value={inputTokens}
                onChange={(e) => setInputTokens(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                step="1000000"
                className="w-full px-3 py-2 border border-[#E5E1DC] rounded-md focus:ring-2 focus:ring-[#6C39EF] focus:border-transparent"
              />
              <p className="text-xs text-[#5B657B] mt-1">
                {(inputTokens / 1000000).toFixed(2)}M tokens
              </p>
            </div>

            <div>
              <label htmlFor="output-tokens" className="block text-sm font-medium text-[#171C26] mb-2">
                Output Tokens per Month
              </label>
              <input
                type="number"
                id="output-tokens"
                value={outputTokens}
                onChange={(e) => setOutputTokens(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                step="1000000"
                className="w-full px-3 py-2 border border-[#E5E1DC] rounded-md focus:ring-2 focus:ring-[#6C39EF] focus:border-transparent"
              />
              <p className="text-xs text-[#5B657B] mt-1">
                {(outputTokens / 1000000).toFixed(2)}M tokens
              </p>
            </div>
          </div>

          <div className="text-sm text-[#5B657B]">
            <p><strong>Example usage:</strong> 1M input + 1M output tokens ≈ 500 pages of text in, 500 pages out</p>
          </div>
        </div>
      ) : null}

      {/* Pricing Table */}
      <div className="overflow-x-auto border border-[#E5E1DC] rounded-lg">
        <table className="w-full">
          <caption className="sr-only">
            LLM and AI service pricing comparison
          </caption>
          <thead className="bg-[#F9F8F5]">
            <tr>
              <th scope="col" className="text-left p-3 border-b border-[#E5E1DC]">
                <button
                  onClick={() => handleSort('name')}
                  className="font-semibold text-[#171C26] hover:text-[#6C39EF] focus-ring rounded"
                  aria-sort={sortKey === 'name' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Name {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th scope="col" className="text-left p-3 border-b border-[#E5E1DC]">
                <button
                  onClick={() => handleSort('provider')}
                  className="font-semibold text-[#171C26] hover:text-[#6C39EF] focus-ring rounded"
                  aria-sort={sortKey === 'provider' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Provider {sortKey === 'provider' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th scope="col" className="text-left p-3 border-b border-[#E5E1DC]">
                <button
                  onClick={() => handleSort('category')}
                  className="font-semibold text-[#171C26] hover:text-[#6C39EF] focus-ring rounded"
                  aria-sort={sortKey === 'category' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Category {sortKey === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th scope="col" className="text-right p-3 border-b border-[#E5E1DC]">
                <button
                  onClick={() => handleSort('input_price_per_1m')}
                  className="font-semibold text-[#171C26] hover:text-[#6C39EF] focus-ring rounded"
                  aria-sort={sortKey === 'input_price_per_1m' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Input $/1M {sortKey === 'input_price_per_1m' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th scope="col" className="text-right p-3 border-b border-[#E5E1DC]">
                <button
                  onClick={() => handleSort('output_price_per_1m')}
                  className="font-semibold text-[#171C26] hover:text-[#6C39EF] focus-ring rounded"
                  aria-sort={sortKey === 'output_price_per_1m' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Output $/1M {sortKey === 'output_price_per_1m' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th scope="col" className="text-right p-3 border-b border-[#E5E1DC]">
                <button
                  onClick={() => handleSort('monthly_price')}
                  className="font-semibold text-[#171C26] hover:text-[#6C39EF] focus-ring rounded"
                  aria-sort={sortKey === 'monthly_price' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Monthly $ {sortKey === 'monthly_price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th scope="col" className="text-right p-3 border-b border-[#E5E1DC]">
                <span className="font-semibold text-[#171C26]">
                  Est. Cost
                </span>
              </th>
              <th scope="col" className="text-center p-3 border-b border-[#E5E1DC]">
                <span className="font-semibold text-[#171C26]">Context</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((item, idx) => {
              const monthlyCost = calculateMonthlyCost(item);
              const bgClass = idx % 2 === 0 ? 'bg-white' : 'bg-[#F9F8F5]';
              
              return (
                <tr key={item.id} className={bgClass}>
                  <td className="p-3 border-b border-[#E5E1DC]">
                    <div className="font-medium text-[#171C26]">{item.name}</div>
                    {item.notes && (
                      <div className="text-xs text-[#5B657B] mt-1">{item.notes}</div>
                    )}
                    {item.has_free_tier && item.free_tier_note && (
                      <div className="text-xs text-[#10A37F] mt-1">
                        Free: {item.free_tier_note}
                      </div>
                    )}
                  </td>
                  <td className="p-3 border-b border-[#E5E1DC] text-[#5B657B] capitalize">
                    {item.provider}
                  </td>
                  <td className="p-3 border-b border-[#E5E1DC]">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#F0EDFF] text-[#6C39EF]">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td className="p-3 border-b border-[#E5E1DC] text-right text-[#171C26]">
                    {formatPrice(item.input_price_per_1m)}
                  </td>
                  <td className="p-3 border-b border-[#E5E1DC] text-right text-[#171C26]">
                    {formatPrice(item.output_price_per_1m)}
                  </td>
                  <td className="p-3 border-b border-[#E5E1DC] text-right text-[#171C26]">
                    {item.monthly_price !== null ? formatPrice(item.monthly_price) : '—'}
                  </td>
                  <td className="p-3 border-b border-[#E5E1DC] text-right font-medium text-[#171C26]">
                    {monthlyCost !== null ? `$${monthlyCost.toFixed(2)}` : '—'}
                  </td>
                  <td className="p-3 border-b border-[#E5E1DC] text-center text-[#5B657B] text-sm">
                    {item.context_window_tokens ? `${(item.context_window_tokens / 1000).toFixed(0)}K` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-[#5B657B]">
        <p>
          <strong>About token pricing:</strong> API models charge per million tokens (input + output). 
          As a rough guide, 1M tokens ≈ 750,000 words or ~500 pages of text. 
          Output tokens usually cost 2-10× more than input tokens because generation requires more compute.
        </p>
        <p className="mt-2">
          <strong>Free tiers:</strong> Many providers offer generous free tiers for testing and light usage. 
          Check provider websites for current limits and restrictions.
        </p>
        <p className="mt-2">
          <strong>Source:</strong> All prices verified from{' '}
          <a href="https://openai.com/api/pricing/" target="_blank" rel="noopener noreferrer" className="text-[#6C39EF] hover:underline">OpenAI</a>,{' '}
          <a href="https://www.anthropic.com/pricing" target="_blank" rel="noopener noreferrer" className="text-[#6C39EF] hover:underline">Anthropic</a>,{' '}
          <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-[#6C39EF] hover:underline">Google</a>,{' '}
          <a href="https://x.ai/api" target="_blank" rel="noopener noreferrer" className="text-[#6C39EF] hover:underline">xAI</a>,{' '}
          <a href="https://docs.mistral.ai/getting-started/pricing/" target="_blank" rel="noopener noreferrer" className="text-[#6C39EF] hover:underline">Mistral</a>, and{' '}
          <a href="https://github.com/features/copilot/plans" target="_blank" rel="noopener noreferrer" className="text-[#6C39EF] hover:underline">GitHub</a> official pricing pages on October 13, 2026.
        </p>
      </div>
    </>
  );
}
