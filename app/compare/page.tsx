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

  if (tools.length < 2) {
    return (
      <div className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max max-w-4xl">
            <h1 className="heading-1 mb-4 text-center">Compare AI Tools</h1>
            <p className="text-lg text-[#5B657B] mb-8 text-center">
              Compare AI tools side-by-side to find the best fit for your needs.
            </p>

            <div id="compare-selector" tabIndex={-1}>
              <Suspense fallback={<p className="text-[#5B657B]">Loading selector…</p>}>
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <caption className="sr-only">
                Side-by-side comparison of {tools.map((t: any) => t.name).join(', ')}
              </caption>
              <thead>
                <tr className="bg-[#F9F8F5]">
                  <th scope="col" className="text-left p-4 border border-[#E5E1DC] font-semibold text-[#171C26] min-w-[200px]">
                    Feature
                  </th>
                  {tools.map((tool: any) => (
                    <th key={tool.id} scope="col" className="p-4 border border-[#E5E1DC] min-w-[250px]">
                      <Link 
                        href={`/tools/${tool.slug}`}
                        className="font-semibold text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded block"
                      >
                        {tool.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="text-left p-4 border border-[#E5E1DC] font-medium text-[#5B657B]">
                    Description
                  </th>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-[#E5E1DC]">
                      {tool.description || tool.tagline || 'No description available'}
                    </td>
                  ))}
                </tr>
                
                <tr className="bg-[#F9F8F5]">
                  <th scope="row" className="text-left p-4 border border-[#E5E1DC] font-medium text-[#5B657B]">
                    Pricing
                  </th>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-[#E5E1DC]">
                      {tool.pricing_summary || 'See website'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <th scope="row" className="text-left p-4 border border-[#E5E1DC] font-medium text-[#5B657B]">
                    Main category
                  </th>
                  {tools.map((tool: any) => {
                    const primaryCat = (tool.tool_categories as any[])?.find(tc => tc.is_primary)?.categories;
                    return (
                      <td key={tool.id} className="p-4 border border-[#E5E1DC]">
                        {primaryCat ? (
                          <Link 
                            href={`/category/${primaryCat.slug}`}
                            className="text-[#6C39EF] hover:underline focus-ring rounded"
                          >
                            {primaryCat.name}
                          </Link>
                        ) : 'Not categorized'}
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-[#F9F8F5]">
                  <th scope="row" className="text-left p-4 border border-[#E5E1DC] font-medium text-[#5B657B]">
                    Website
                  </th>
                  {tools.map((tool: any) => {
                    const paid = toolHasAffiliate(affiliates, tool.slug);
                    return (
                      <td key={tool.id} className="p-4 border border-[#E5E1DC]">
                        <a
                          href={visitHref(affiliates, tool.slug)}
                          rel={paid ? 'sponsored nofollow noopener' : 'noopener'}
                          className="text-[#6C39EF] hover:underline focus-ring rounded"
                        >
                          Visit {tool.name}
                          {paid ? <span className="sr-only"> (paid link)</span> : null}
                        </a>
                        {paid ? (
                          <p className="text-xs text-[#5B657B] mt-1">
                            <span className="font-medium text-[#C62810]">Paid link:</span>{' '}
                            We may earn a commission if you sign up.
                          </p>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <th scope="row" className="text-left p-4 border border-[#E5E1DC] font-medium text-[#5B657B]">
                    Info last checked
                  </th>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-[#E5E1DC]">
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
            <Suspense fallback={<p className="text-[#5B657B]">Loading selector…</p>}>
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
