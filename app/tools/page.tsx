import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fallbackCategories, fallbackTools } from '@/lib/fallback-data';
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
    .order('name');

  if (tools && tools.length > 0) {
    return tools;
  }

  return fallbackTools
    .filter((tool) => tool.status === 'published')
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  if (data && data.length > 0) {
    return data;
  }

  return fallbackCategories;
}

export const metadata = {
  title: 'AI Tools Directory - All Tools',
  description: 'Browse our complete directory of AI tools. Each tool includes what it does, who it\'s for, and real pricing.',
  alternates: { canonical: '/tools' },
};

export default async function ToolsPage(props: {
  searchParams: Promise<{ q?: string; category?: string; price?: string; free?: string }>;
}) {
  const searchParams = await props.searchParams;
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

      <div className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max">
            <div className="mb-8">
              <h1 className="heading-1 mb-4">All AI Tools</h1>
              <p className="text-lead">
                {tools.length} curated tools. No fake ratings.
              </p>
            </div>

            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-[#171C26]">
                Some links are paid links. They never change our ranking.{' '}
                <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
                  How we make money
                </Link>
              </p>
            </div>

            <ToolsClient
              initialTools={tools}
              categories={categories}
              initialQuery={searchParams.q || ''}
              initialCategory={searchParams.category || 'all'}
              initialPrice={searchParams.price || 'all'}
              initialFree={searchParams.free === '1'}
            />

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
