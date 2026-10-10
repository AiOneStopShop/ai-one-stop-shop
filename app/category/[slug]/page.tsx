import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateItemListSchema, generateBreadcrumbSchema, safeJsonLd } from '@/lib/json-ld';

async function getCategory(slug: string) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  return data;
}

async function getCategoryTools(categoryId: string) {
  const { data } = await supabase
    .from('tools')
    .select(`
      *,
      tool_categories!inner(category_id)
    `)
    .eq('status', 'published')
    .eq('tool_categories.category_id', categoryId)
    .order('editorial_score', { ascending: false, nullsFirst: false });

  return data || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `Best ${category.name} AI Tools`,
    description: category.description || `Discover the best AI tools for ${category.name.toLowerCase()}`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  const tools = await getCategoryTools(category.id);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
    { name: category.name, url: `/category/${category.slug}` }
  ]);

  const itemList = generateItemListSchema(
    `Best ${category.name} AI Tools`,
    category.description || '',
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
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link href="/" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-[#5B657B]">/</li>
                <li>
                  <Link href="/tools" className="text-[#5B657B] hover:text-[#6C39EF] focus-ring rounded">
                    Tools
                  </Link>
                </li>
                <li aria-hidden="true" className="text-[#5B657B]">/</li>
                <li aria-current="page" className="text-[#171C26] font-medium">
                  {category.name}
                </li>
              </ol>
            </nav>

            {/* Header */}
            <div className="mb-8">
              <h1 className="heading-1 mb-4">
                {category.icon} Best {category.name} AI Tools
              </h1>
              {category.description && (
                <p className="text-lead">{category.description}</p>
              )}
              <p className="text-[#5B657B] mt-2">
                {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
              </p>
            </div>

            {/* Tools Grid */}
            {tools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool: any, index: number) => (
                  <article key={tool.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#6C39EF] font-bold">#{index + 1}</span>
                        <h2 className="heading-3">
                          <Link 
                            href={`/tools/${tool.slug}`}
                            className="hover:text-[#6C39EF] transition-colors focus-ring rounded"
                          >
                            {tool.name}
                          </Link>
                        </h2>
                      </div>
                      {tool.has_free_tier && (
                        <span className="badge bg-green-50 text-green-700 border border-green-200 text-xs">
                          Free
                        </span>
                      )}
                    </div>

                    {tool.tagline && (
                      <p className="text-[#5B657B] mb-3 line-clamp-2">{tool.tagline}</p>
                    )}

                    {tool.editorial_why && tool.editorial_why.trim().length > 0 && (
                      <p className="text-sm text-[#171C26] mb-4 italic">
                        "{tool.editorial_why}"
                      </p>
                    )}

                    {tool.pricing_summary && (
                      <p className="text-sm font-medium text-[#171C26] mb-4">
                        From {tool.pricing_summary}
                      </p>
                    )}

                    <Link 
                      href={`/tools/${tool.slug}`}
                      className="btn-secondary w-full"
                    >
                      View details
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#F9F8F5] rounded-xl">
                <p className="text-lg text-[#5B657B] mb-4">
                  No tools in this category yet.
                </p>
                <Link href="/tools" className="text-[#6C39EF] hover:underline focus-ring rounded">
                  Browse all tools
                </Link>
              </div>
            )}

            {/* How We Rank */}
            <div className="mt-16 bg-[#F3EFFF] border border-[#6C39EF] rounded-xl p-8">
              <h2 className="heading-2 mb-4">How we chose these tools</h2>
              <p className="text-lg mb-4">
                Every tool here has been checked by hand. We rank them by what works best for the job, not by who pays us.
              </p>
              <Link href="/how-we-rank" className="text-[#6C39EF] font-medium hover:underline focus-ring rounded">
                Read our full ranking method →
              </Link>
            </div>

            {/* Back Link */}
            <div className="mt-12 pt-12 border-t border-[#E5E1DC]">
              <Link href="/tools" className="text-[#6C39EF] hover:underline focus-ring rounded">
                ← Back to all tools
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
