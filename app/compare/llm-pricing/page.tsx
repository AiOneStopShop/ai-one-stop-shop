import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { LLMPricing } from '@/types/database';
import { LLMPricingClient } from './LLMPricingClient';

export const metadata: Metadata = {
  title: 'LLM API & Token Cost Comparison',
  description: 'Compare LLM API pricing, consumer chat plans, and coding agent costs. Real prices from OpenAI, Anthropic, Google, xAI, Mistral, and more.',
  alternates: { canonical: '/compare/llm-pricing' },
};

export const revalidate = 3600; // Revalidate every hour

async function getLLMPricing(): Promise<LLMPricing[]> {
  try {
    const { data, error } = await supabase
      .from('llm_pricing')
      .select('*')
      .order('provider')
      .order('name');

    if (error) {
      console.error('Error fetching LLM pricing:', error);
      return [];
    }

    return (data || []) as LLMPricing[];
  } catch (error) {
    console.error('Exception fetching LLM pricing:', error);
    return [];
  }
}

export default async function LLMPricingPage() {
  const pricing = await getLLMPricing();

  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-[#5B657B]">/</li>
              <li>
                <Link href="/compare" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">
                  Compare
                </Link>
              </li>
              <li aria-hidden="true" className="text-[#5B657B]">/</li>
              <li aria-current="page" className="text-[#171C26] font-medium">
                LLM Pricing
              </li>
            </ol>
          </nav>

          <h1 className="heading-1 mb-4">LLM API & Token Cost Comparison</h1>
          <p className="text-lead mb-8">
            Compare API costs per million tokens, monthly consumer plans, and coding agent pricing across major AI providers. 
            All prices verified from official provider pages.
          </p>

          <div className="bg-[#FFF8E5] border border-[#FFD666] rounded-lg p-4 mb-8">
            <p className="text-sm text-[#171C26]">
              <strong>Pricing Disclaimer:</strong> Prices from official provider pages, checked October 13, 2026. 
              Verify current pricing before purchasing. AI costs are changing rapidly—models and plans evolve frequently. 
              Check provider websites for the latest rates, free tiers, and special offers.
            </p>
          </div>

          <LLMPricingClient pricing={pricing} />

          <div className="mt-12 prose prose-slate max-w-none">
            <h2 className="heading-2 mb-4">About This Comparison</h2>
            <p className="text-[#5B657B] mb-4">
              This comparison helps you understand the cost of using AI models through APIs, consumer chat interfaces, 
              and coding agents. We track pricing from official sources and note when information is unavailable or has changed.
            </p>
            
            <h3 className="text-xl font-semibold text-[#171C26] mb-2">Understanding AI Pricing</h3>
            <ul className="list-disc pl-6 space-y-2 text-[#5B657B] mb-6">
              <li>
                <strong>API Models:</strong> Pay per token (usually per million). Input tokens = your prompts; 
                output tokens = the model's responses. Costs vary by model intelligence and speed.
              </li>
              <li>
                <strong>Consumer Plans:</strong> Fixed monthly subscription for unlimited or high-volume usage 
                through web/mobile apps. Good for daily use without tracking tokens.
              </li>
              <li>
                <strong>Coding Agents:</strong> AI coding assistants (like Claude Code, GitHub Copilot) with 
                specialized features for developers. Some are standalone, others included in chat plans.
              </li>
              <li>
                <strong>Local/Open-Source:</strong> Run models on your own hardware or cloud. No per-token charges, 
                but you pay for compute resources (GPU, CPU, RAM, hosting).
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-[#171C26] mb-2">Cost-Saving Tips</h3>
            <ul className="list-disc pl-6 space-y-2 text-[#5B657B]">
              <li>Use smaller models (like Haiku or Flash) for simple tasks—they're faster and cheaper.</li>
              <li>For high-volume API use, check if the provider offers batch processing or caching discounts.</li>
              <li>Many providers have generous free tiers; test before committing to paid plans.</li>
              <li>Local models (Ollama, llama.cpp) eliminate per-token costs if you have suitable hardware.</li>
              <li>Consumer plans often include API credits—Claude Max and GitHub Copilot Max bundle monthly credits.</li>
            </ul>
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/budget" className="btn-secondary">
              ← Budget Calculator
            </Link>
            <Link href="/compare" className="btn-secondary">
              Compare AI Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
