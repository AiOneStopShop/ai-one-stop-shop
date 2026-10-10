import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Tool, Category } from '@/types/database';
import { generateItemListSchema, generateBreadcrumbSchema } from '@/lib/json-ld';
import { ToolsClient } from './ToolsClient';

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
    'Hand-checked AI tools with honest reviews',
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

            {/* Tools with Search and Filters */}
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
      </div>
    </>
  );
}
