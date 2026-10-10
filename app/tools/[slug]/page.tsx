import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Tool, Category } from '@/types/database';
import { generateToolSchema, generateBreadcrumbSchema, safeJsonLd } from '@/lib/json-ld';
import { ExternalLink } from 'lucide-react';

async function getTool(slug: string) {
  const { data } = await supabase
    .from('tools')
    .select(`
      *,
      tool_categories(
        is_primary,
        categories(*)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return data;
}

async function getAffiliateLink(toolId: string) {
  const { data } = await supabase
    .from('affiliate_links')
    .select('go_slug')
    .eq('tool_id', toolId)
    .eq('is_active', true)
    .single();

  return data?.go_slug;
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const tool = await getTool(params.slug);
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }

  return {
    title: `${tool.name} - ${tool.tagline || 'AI Tool'}`,
    description: tool.description || tool.tagline,
  };
}

export default async function ToolPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const tool = await getTool(params.slug);

  if (!tool) {
    notFound();
  }

  const categories = (tool.tool_categories as any[])?.map(tc => tc.categories).filter(Boolean) || [];
  const primaryCategory = (tool.tool_categories as any[])?.find(tc => tc.is_primary)?.categories;
  const affiliateSlug = await getAffiliateLink(tool.id);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
    { name: tool.name, url: `/tools/${tool.slug}` }
  ]);

  const toolSchema = generateToolSchema(tool, categories);

  // Determine the visit link
  const visitUrl = affiliateSlug ? `/go/${affiliateSlug}` : tool.website_url;
  const isAffiliate = !!affiliateSlug;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(toolSchema) }}
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
                  {tool.name}
                </li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  {tool.is_sponsored && (
                    <span className="badge-sponsored mb-3 inline-block">
                      Sponsored
                    </span>
                  )}
                  <h1 className="heading-1 mb-3">{tool.name}</h1>
                  {tool.tagline && (
                    <p className="text-xl text-[#5B657B]">{tool.tagline}</p>
                  )}
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat: Category) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="badge bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors focus-ring rounded"
                      >
                        {cat.icon} {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Description */}
                {tool.description && (
                  <div className="prose prose-lg max-w-none mb-8">
                    <p>{tool.description}</p>
                  </div>
                )}

                {/* Editorial Why */}
                {tool.editorial_why && (
                  <div className="bg-[#F3EFFF] border border-[#6C39EF] rounded-lg p-6 mb-8">
                    <h2 className="heading-3 mb-2">Why we picked this</h2>
                    <p className="text-[#171C26]">{tool.editorial_why}</p>
                  </div>
                )}

                {/* Features */}
                {tool.features && tool.features.length > 0 && (
                  <div className="mb-8">
                    <h2 className="heading-2 mb-4">Key features</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tool.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#6C39EF] mt-1">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Platforms */}
                {tool.platforms && tool.platforms.length > 0 && (
                  <div className="mb-8">
                    <h2 className="heading-3 mb-3">Available on</h2>
                    <div className="flex flex-wrap gap-2">
                      {tool.platforms.map((platform: string, idx: number) => (
                        <span key={idx} className="badge bg-gray-100 text-gray-700 border border-gray-300">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  {/* Pricing Card */}
                  <div className="card">
                    <h2 className="heading-3 mb-4">Pricing</h2>
                    
                    {tool.pricing_summary && (
                      <p className="text-2xl font-bold text-[#171C26] mb-2">
                        {tool.pricing_summary}
                      </p>
                    )}
                    
                    {tool.has_free_tier === true && (
                      <span className="badge bg-green-50 text-green-700 border border-green-200 mb-4 inline-block">
                        ✓ Free tier available
                      </span>
                    )}

                    {tool.pricing_model && (
                      <p className="text-sm text-[#5B657B] mb-4 capitalize">
                        {tool.pricing_model.replace('-', ' ')} pricing
                      </p>
                    )}

                    {tool.last_verified_at && (
                      <p className="text-xs text-[#5B657B] mb-6">
                        Price checked {new Date(tool.last_verified_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </p>
                    )}

                    {/* Visit Button */}
                    <a
                      href={visitUrl}
                      target="_blank"
                      rel={isAffiliate ? 'sponsored nofollow' : 'noopener noreferrer'}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      Visit {tool.name}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>

                    {/* Compare Button */}
                    <Link
                      href={`/compare?tools=${tool.slug}`}
                      className="btn-secondary w-full block text-center mt-3"
                    >
                      Compare with...
                    </Link>

                    {isAffiliate && (
                      <p className="text-xs text-[#5B657B] mt-3 flex items-start gap-1">
                        <span className="font-medium text-[#C62810]">Paid link:</span>
                        <span>
                          We may earn a commission if you sign up. It never changes our ranking.{' '}
                          <Link href="/disclosure" className="text-[#6C39EF] hover:underline focus-ring rounded">
                            How we make money
                          </Link>
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Last Verified */}
                  {tool.source_url && (
                    <div className="card">
                      <h3 className="heading-3 mb-2">Source</h3>
                      <a
                        href={tool.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#6C39EF] hover:underline focus-ring rounded"
                      >
                        Official pricing page ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Back to tools */}
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
