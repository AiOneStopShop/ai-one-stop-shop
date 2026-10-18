import { Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { knownSlugsInOrder, orderBySlug } from '@/lib/compare-tools';
import { getActiveAffiliateGoSlugs, toolHasAffiliate, visitHref } from '@/lib/affiliate-links';
import { fallbackTools } from '@/lib/fallback-data';
import { ChangeSelectionLink } from './ChangeSelectionLink';
import { CompareSelector } from './CompareSelector';

export const metadata = {
  title: 'Compare AI Tools',
  description: 'Compare AI tools side-by-side to find the best fit for your needs.',
  alternates: { canonical: '/compare' },
};

async function getToolsForComparison(slugs: string[]) {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        tool_categories(
          is_primary,
          categories(*)
        )
      `);

    if (error) {
      console.error('Supabase error in compare:', error);
    }
    
    const filtered = (data || []).filter((tool: any) => 
      slugs.includes(tool.slug) && tool.status === 'published'
    );

    if (filtered.length > 0) {
      return orderBySlug(filtered, slugs);
    }

    return orderBySlug(
      fallbackTools.filter((tool: any) =>
        slugs.includes(tool.slug) && tool.status === 'published'
      ),
      slugs
    );
  } catch (error) {
    console.error('Exception in getToolsForComparison:', error);
    return [];
  }
}

export default async function ComparePage(props: {
  searchParams: Promise<{ tools?: string }>;
}) {
  const searchParams = await props.searchParams;
  const requestedSlugs = searchParams.tools?.split(',').filter(Boolean) || [];

  const { data: allTools } = await supabase
    .from('tools')
    .select('slug, name')
    .eq('status', 'published')
    .order('name')
    .limit(200);

  const availableTools = (allTools && allTools.length > 0)
    ? allTools
    : fallbackTools.filter(t => t.status === 'published').map(t => ({ slug: t.slug, name: t.name }));

  const toolSlugs = knownSlugsInOrder(requestedSlugs, availableTools);
  const [tools, affiliates] = await Promise.all([
    toolSlugs.length > 0 ? getToolsForComparison(toolSlugs) : Promise.resolve([]),
    getActiveAffiliateGoSlugs(),
  ]);

  const hasPaidLinks = tools.some((t: any) => toolHasAffiliate(affiliates, t.slug));

  if (tools.length < 2) {
    return (
      <div className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max max-w-4xl">
            <h1 className="heading-1 mb-4 text-center">Compare AI Tools</h1>
            <p className="text-lg text-soft mb-8 text-center">
              Compare AI tools side-by-side to find the best fit for your needs.
            </p>

            <div id="compare-selector" tabIndex={-1}>
              <Suspense fallback={<p className="text-soft">Loading selector…</p>}>
                <CompareSelector tools={availableTools} />
              </Suspense>
            </div>

            <div className="text-center mt-8">
              <Link href="/tools" className="btn-secondary">
                ← Back to All Tools
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max">
          <div className="mb-8">
            <div className="mb-4 text-center">
              <ChangeSelectionLink />
            </div>
            <h1 className="heading-1 mb-6 text-center">
              Compare {tools.map((t: any) => t.name).join(' vs ')}
            </h1>
          </div>

          {/* Comparison Table */}
          {hasPaidLinks && (
            <p className="text-sm font-semibold text-orange-ink mb-4 text-center">
              Paid link: Some tools below have paid links that may earn us a commission.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <caption className="sr-only">
                Side-by-side comparison of {tools.map((t: any) => t.name).join(', ')}
              </caption>
              <thead>
                <tr className="bg-cream">
                  <th scope="col" className="text-left p-4 border border-line font-semibold text-ink min-w-[200px]">
                    Feature
                  </th>
                  {tools.map((tool: any) => (
                    <th key={tool.id} scope="col" className="p-4 border border-line min-w-[250px]">
                      <Link 
                        href={`/tools/${tool.slug}`}
                        className="font-semibold text-ink hover:text-green transition-colors focus-ring rounded block"
                      >
                        {tool.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="text-left p-4 border border-line font-medium text-soft">
                    Description
                  </th>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-line">
                      {tool.description || tool.tagline || 'No description available'}
                    </td>
                  ))}
                </tr>
                
                <tr className="bg-cream">
                  <th scope="row" className="text-left p-4 border border-line font-medium text-soft">
                    Pricing
                  </th>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-line">
                      {tool.pricing_summary || 'See website'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th scope="row" className="text-left p-4 border border-line font-medium text-soft">
                    Main category
                  </th>
                  {tools.map((tool: any) => {
                    const primaryCat = (tool.tool_categories as any[])?.find(tc => tc.is_primary)?.categories;
                    return (
                      <td key={tool.id} className="p-4 border border-line">
                        {primaryCat ? (
                          <Link 
                            href={`/category/${primaryCat.slug}`}
                            className="text-green hover:underline focus-ring rounded"
                          >
                            {primaryCat.name}
                          </Link>
                        ) : 'Not categorized'}
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-cream">
                  <th scope="row" className="text-left p-4 border border-line font-medium text-soft">
                    Website
                  </th>
                  {tools.map((tool: any) => {
                    const paid = toolHasAffiliate(affiliates, tool.slug);
                    return (
                      <td key={tool.id} className="p-4 border border-line align-top">
                        {paid ? (
                          <p className="text-sm font-semibold text-orange-ink mb-2">
                            Paid link: we may earn a commission if you sign up.
                          </p>
                        ) : null}
                        <a
                          href={visitHref(affiliates, tool.slug)}
                          rel={paid ? 'sponsored nofollow noopener' : 'noopener'}
                          className="text-green hover:underline focus-ring rounded"
                        >
                          Visit {tool.name}
                          {paid ? <span className="sr-only"> (paid link)</span> : null}
                        </a>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <th scope="row" className="text-left p-4 border border-line font-medium text-soft">
                    Info last checked
                  </th>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-line">
                      {tool.updated_at ? new Date(tool.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC'
                      }) : tool.created_at ? new Date(tool.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC'
                      }) : 'Date not available'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div id="compare-selector" tabIndex={-1} className="mt-12 max-w-4xl mx-auto">
            <Suspense fallback={<p className="text-soft">Loading selector…</p>}>
              <CompareSelector tools={availableTools} />
            </Suspense>
          </div>

          <div className="mt-8 text-center">
            <Link href="/tools" className="btn-secondary">
              ← Back to All Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
