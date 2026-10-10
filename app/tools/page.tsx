import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Tool, Category } from '@/types/database';
import { generateItemListSchema, generateBreadcrumbSchema } from '@/lib/json-ld';

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
    tools.map(tool => ({
      name: tool.name,
      url: `/tools/${tool.slug}`,
      description: tool.tagline || ''
    }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
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

            {/* Categories Filter */}
            {categories.length > 0 && (
              <div className="mb-8">
                <h2 className="heading-3 mb-4">Browse by category</h2>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/tools"
                    className="px-4 py-2 bg-[#6C39EF] text-white rounded-lg font-medium hover:bg-[#5A2FD0] transition-colors focus-ring"
                  >
                    All tools
                  </Link>
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="px-4 py-2 bg-white border border-[#E5E1DC] rounded-lg font-medium hover:border-[#6C39EF] hover:text-[#6C39EF] transition-colors focus-ring"
                    >
                      {cat.icon} {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool: any) => {
                const primaryCategory = tool.tool_categories?.find((tc: any) => tc.is_primary)?.categories;
                
                return (
                  <article key={tool.id} className="card group">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="heading-3">
                        <Link 
                          href={`/tools/${tool.slug}`}
                          className="group-hover:text-[#6C39EF] transition-colors focus-ring rounded"
                        >
                          {tool.name}
                        </Link>
                      </h2>
                      {tool.is_sponsored && (
                        <span className="badge-sponsored text-xs">Sponsored</span>
                      )}
                    </div>

                    {tool.tagline && (
                      <p className="text-[#5B657B] mb-3 line-clamp-2">{tool.tagline}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {tool.has_free_tier && (
                        <span className="badge bg-green-50 text-green-700 border border-green-200 text-xs">
                          Free tier
                        </span>
                      )}
                      {primaryCategory && (
                        <span className="badge bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                          {primaryCategory.name}
                        </span>
                      )}
                    </div>

                    {tool.pricing_summary && (
                      <p className="text-sm font-medium text-[#171C26] mb-4">
                        From {tool.pricing_summary}
                      </p>
                    )}

                    {tool.last_verified_at && (
                      <p className="text-xs text-[#5B657B] mb-4">
                        Last checked {new Date(tool.last_verified_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}

                    <Link 
                      href={`/tools/${tool.slug}`}
                      className="btn-secondary w-full"
                    >
                      View details
                    </Link>
                  </article>
                );
              })}
            </div>

            {tools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-[#5B657B]">No tools found. Check back soon!</p>
              </div>
            )}

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
