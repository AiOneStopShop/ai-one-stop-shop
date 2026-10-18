import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Tool, Category } from '@/types/database';
import { generateToolSchema, generateBreadcrumbSchema, safeJsonLd } from '@/lib/json-ld';
import { isToolSponsored } from '@/lib/sponsor-placements';
import { SponsoredLabel } from '@/components/SponsoredLabel';
import { Check, ExternalLink } from 'lucide-react';

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
    alternates: { canonical: `/tools/${tool.slug}` },
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
  const isSponsored = await isToolSponsored(tool.id);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools' },
    { name: tool.name, url: `/tools/${tool.slug}` }
  ]);

  const toolSchema = generateToolSchema(tool, categories);

  const visitUrl = `/go/${affiliateSlug || tool.slug}`;
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

      <div className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link href="/" className="text-soft hover:text-green focus-ring rounded">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-soft">/</li>
                <li>
                  <Link href="/tools" className="text-soft hover:text-green focus-ring rounded">
                    Tools
                  </Link>
                </li>
                <li aria-hidden="true" className="text-soft">/</li>
                <li aria-current="page" className="text-ink font-medium">
                  {tool.name}
                </li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  {isSponsored && (
                    <SponsoredLabel className="mb-3" />
                  )}
                  <h1 className="heading-1 mb-3">{tool.name}</h1>
                  {tool.tagline && (
                    <p className="text-xl text-soft">{tool.tagline}</p>
                  )}
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat: Category) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="badge bg-cream-2 text-ink border border-line hover:bg-cream-2 transition-colors focus-ring rounded"
                      >
                        {cat.icon ? <span aria-hidden="true">{cat.icon} </span> : null}
                        {cat.name}
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
                  <div className="note mb-8">
                    <h2 className="heading-3 mb-2">Why we picked this</h2>
                    <p className="text-ink">{tool.editorial_why}</p>
                  </div>
                )}

                {/* Features */}
                {tool.features && tool.features.length > 0 && (
                  <div className="mb-8">
                    <h2 className="heading-2 mb-4">Key features</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tool.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 mt-1 shrink-0 text-green-2" aria-hidden="true" />
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
                        <span key={idx} className="badge bg-cream-2 text-soft border border-line">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-6">
                  {/* Pricing Card */}
                  <div className="card">
                    <h2 className="heading-3 mb-4">Pricing</h2>
                    
                    {tool.pricing_summary && (
                      <p className="text-2xl font-bold text-ink mb-2">
                        {tool.pricing_summary}
                      </p>
                    )}
                    
                    {tool.has_free_tier === true && (
                      <span className="badge bg-leaf text-green border border-leaf-line mb-4 inline-block">
                        Free tier available
                      </span>
                    )}

                    {tool.pricing_model && (
                      <p className="text-sm text-soft mb-4 capitalize">
                        {tool.pricing_model.replace(/-/g, ' ')} pricing
                      </p>
                    )}

                    {tool.last_verified_at && (
                      <p className="text-xs text-soft mb-6">
                        Price checked {new Date(tool.last_verified_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </p>
                    )}

                    {/* Paid link disclosure - must appear immediately ABOVE the Visit button */}
                    {isAffiliate && (
                      <p id="paid-note" className="text-sm text-orange-ink mb-2">
                        Paid link: we may earn a commission.{' '}
                        <Link href="/disclosure#paid-links" className="underline hover:text-[#A02010]">
                          How we make money
                        </Link>
                      </p>
                    )}

                    {/* Visit Button */}
                    <a
                      href={visitUrl}
                      target="_blank"
                      rel={isAffiliate ? 'sponsored nofollow noopener' : 'noopener'}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                      aria-describedby={isAffiliate ? 'paid-note' : undefined}
                    >
                      Visit {tool.name}
                      <span className="sr-only">{isAffiliate ? ' (paid link, opens in a new tab)' : ' (opens in new tab)'}</span>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>

                    {/* Compare Button */}
                    <Link
                      href={`/compare?tools=${tool.slug}`}
                      className="btn-secondary w-full block text-center mt-3"
                    >
                      Compare with...
                    </Link>
                  </div>

                  {/* Last Verified */}
                  {tool.source_url && (
                    <div className="card">
                      <h3 className="heading-3 mb-2">Source</h3>
                      <a
                        href={tool.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green hover:underline focus-ring rounded"
                      >
                        {/\/(pricing|plans|price)(\/|$|\?)/i.test(tool.source_url)
                          ? 'Official pricing page'
                          : 'Official site'}
                        <span className="sr-only"> (opens in new tab)</span>
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Back to tools */}
            <div className="mt-12 pt-12 border-t border-line">
              <Link href="/tools" className="text-green hover:underline focus-ring rounded">
                ← Back to all tools
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
