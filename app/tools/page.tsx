import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Tool, Category } from '@/types/database';
import { generateItemListSchema, generateBreadcrumbSchema, safeJsonLd } from '@/lib/json-ld';
import { ToolsClient } from './ToolsClient';
import { StickyCompareButton } from './CompareCheckbox';

async function getTools() {
  const { data: tools } = await supabase
    .from('tools')
    .select(`
      *,
      tool_categories!inner(
        category_id,
        is_primary,
        categories(*)
      )
    `)
    .eq('status', 'published')
    .order('editorial_score', { ascending: false, nullsFirst: false })
    .order('name');

  return tools || [];
}

async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  
  return data || [];
}

export const metadata = {
  title: 'AI Tools Directory - All Tools',
  description: 'Browse our complete directory of hand-checked AI tools. Each tool includes what it does, who it\'s for, real pricing, and when we last verified it.',
};

export default async function ToolsPage() {
  const tools = await getTools();
  const categories = await getCategories();

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' }
  ]);

  const itemList = generateItemListSchema(
    'AI Tools Directory',
    'Browse AI tools with pricing and feature details',
    tools.map((tool: any) => ({
      name: tool.name,
      url: `/tools/${tool.slug}`,
      description: tool.tagline || ''
    }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }}
      />

      <div id="main-content" className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max">
            {/* Header */}
            <div className="mb-8">
              <h1 className="heading-1 mb-4">All AI Tools</h1>
              <p className="text-lead">
                {tools.length} tools, each checked by hand. No fake ratings.
              </p>
            </div>

            {/* Disclosure */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-[#171C26]">
                Some links are paid links. They never change our ranking.{' '}
                <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
                  How we make money
                </Link>
              </p>
            </div>

            {/* Initial Tools Grid (SSR) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {tools.slice(0, 6).map((tool: any) => {
                const primaryCategory = (tool.tool_categories as any[])?.find((tc: any) => tc.is_primary)?.categories;
                
                return (
                  <article key={tool.id} className="card hover:shadow-lg transition-shadow group">
                    <Link href={`/tools/${tool.slug}`} className="flex flex-col h-full">
                      <h2 className="heading-3 mb-2 group-hover:text-[#6C39EF] transition-colors">
                        {tool.name}
                      </h2>
                      {tool.is_sponsored && (
                        <span className="badge-sponsored text-xs mb-2">Sponsored</span>
                      )}

                      {tool.tagline && (
                        <p className="text-[#5B657B] mb-3 line-clamp-2">{tool.tagline}</p>
                      )}

                      {primaryCategory && (
                        <div className="mb-3">
                          <span className="badge-category text-xs">
                            {primaryCategory.icon} {primaryCategory.name}
                          </span>
                        </div>
                      )}

                      {tool.pricing_summary && (
                        <p className="text-sm text-[#6C39EF] font-medium mt-auto">
                          {tool.pricing_summary}
                        </p>
                      )}
                    </Link>
                  </article>
                );
              })}
            </div>

            {/* Interactive Filters and Full List */}
            <ToolsClient initialTools={tools} categories={categories} />

            {/* Submit CTA */}
            <div className="mt-16 bg-[#F3EFFF] border border-[#6C39EF] rounded-2xl p-8 text-center">
              <h2 className="heading-2 mb-4">Can't find a tool?</h2>
              <p className="text-lead mb-6">Suggest a tool for us to review</p>
              <Link href="/submit" className="btn-primary">
                Submit a tool
              </Link>
            </div>
          </div>
        </section>
        <StickyCompareButton />
      </div>
    </>
  );
}
