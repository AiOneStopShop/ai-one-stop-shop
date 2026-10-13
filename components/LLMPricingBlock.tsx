'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LLMPricing } from '@/types/database';

interface Props {
  toolSlug: string;
}

export function LLMPricingBlock({ toolSlug }: Props) {
  const [pricing, setPricing] = useState<LLMPricing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      try {
        // Map tool slugs to pricing slugs
        const pricingSlugMap: Record<string, string> = {
          'chatgpt': 'chatgpt-plus',
          'chatgpt-plus': 'chatgpt-plus',
          'claude': 'claude-pro',
          'claude-pro': 'claude-pro',
          'claude-code': 'claude-code',
          'gemini': 'gemini-pro-plan',
          'gemini-pro': 'gemini-pro-plan',
          'github-copilot': 'github-copilot-pro',
          'perplexity': 'perplexity',
          'ollama': 'ollama',
          'llama-cpp': 'llama-cpp',
          'localai': 'localai',
          'jan': 'jan',
          'anythingllm': 'anythingllm',
          'librechat': 'librechat',
          'cherry-studio': 'cherry-studio',
          'huggingchat': 'huggingchat',
          'privategpt': 'privategpt',
          'continue': 'continue',
          'onyx': 'onyx',
          'open-notebook': 'open-notebook'
        };

        const pricingSlug = pricingSlugMap[toolSlug];
        if (!pricingSlug) {
          setLoading(false);
          return;
        }

        // Fetch from API
        const response = await fetch(`/api/v1/llm-pricing?slug=${pricingSlug}`);
        if (response.ok) {
          const data = await response.json();
          setPricing(data);
        }
      } catch (error) {
        console.error('Error fetching LLM pricing:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPricing();
  }, [toolSlug]);

  if (loading || !pricing) {
    return null;
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'See provider';
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-[#F0EDFF] border border-[#C7BDFF] rounded-lg p-6 mt-6">
      <h2 className="text-lg font-semibold text-[#171C26] mb-4">Pricing Information</h2>
      
      {pricing.category === 'api-model' && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-[#5B657B]">Input (per 1M tokens):</span>
            <span className="font-medium text-[#171C26]">{formatPrice(pricing.input_price_per_1m)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5B657B]">Output (per 1M tokens):</span>
            <span className="font-medium text-[#171C26]">{formatPrice(pricing.output_price_per_1m)}</span>
          </div>
          {pricing.cached_input_price_per_1m && (
            <div className="flex justify-between">
              <span className="text-[#5B657B]">Cached input (per 1M tokens):</span>
              <span className="font-medium text-[#171C26]">{formatPrice(pricing.cached_input_price_per_1m)}</span>
            </div>
          )}
          {pricing.context_window_tokens && (
            <div className="flex justify-between">
              <span className="text-[#5B657B]">Context window:</span>
              <span className="font-medium text-[#171C26]">
                {(pricing.context_window_tokens / 1000).toFixed(0)}K tokens
              </span>
            </div>
          )}
        </div>
      )}

      {pricing.category === 'consumer-plan' && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-[#5B657B]">Monthly price:</span>
            <span className="font-medium text-[#171C26]">{formatPrice(pricing.monthly_price)}</span>
          </div>
          {pricing.has_free_tier && pricing.free_tier_note && (
            <div className="text-sm text-[#10A37F] mt-2">
              <strong>Free tier:</strong> {pricing.free_tier_note}
            </div>
          )}
        </div>
      )}

      {pricing.category === 'local' && (
        <div className="mb-4">
          <p className="text-[#5B657B]">
            <strong>Free to run locally.</strong> You pay for your own hardware or cloud compute. 
            No per-token charges.
          </p>
        </div>
      )}

      {pricing.category === 'agent-service' && pricing.notes && (
        <div className="mb-4">
          <p className="text-[#5B657B]">{pricing.notes}</p>
        </div>
      )}

      {pricing.notes && pricing.category === 'api-model' && (
        <div className="text-sm text-[#5B657B] mb-4 p-3 bg-white rounded border border-[#E5E1DC]">
          {pricing.notes}
        </div>
      )}

      <div className="pt-4 border-t border-[#C7BDFF] text-sm text-[#5B657B]">
        <p>
          Pricing from{' '}
          <a 
            href={pricing.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#6C39EF] hover:underline focus-ring rounded"
          >
            official source
          </a>
          , checked {formatDate(pricing.last_checked_date)}.
        </p>
        <p className="mt-2">
          <Link 
            href="/compare/llm-pricing" 
            className="text-[#6C39EF] hover:underline focus-ring rounded"
          >
            Compare all LLM pricing →
          </Link>
        </p>
      </div>
    </div>
  );
}
