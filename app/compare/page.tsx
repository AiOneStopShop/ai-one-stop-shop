import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

async function getToolsForComparison(slugs: string[]) {
  try {
    // Fetch all tools and filter client-side to work with fallback mock
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
      return [];
    }
    
    // Filter to requested slugs and published status
    const filtered = (data || []).filter((tool: any) => 
      slugs.includes(tool.slug) && tool.status === 'published'
    );
    
    return filtered;
  } catch (error) {
    console.error('Exception in getToolsForComparison:', error);
    return [];
  }
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { tools?: string };
}) {
  const toolSlugs = searchParams.tools?.split(',').filter(Boolean) || [];

  if (toolSlugs.length === 0) {
    return (
      <div id="main-content" className="scroll-mt-16">
        <section className="section-spacing">
          <div className="container-max max-w-2xl text-center">
            <h1 className="heading-1 mb-4">Compare AI Tools</h1>
            <p className="text-lead mb-8">
              Compare tools side by side to find the best fit for your needs.
            </p>
            <p className="text-[#5B657B] mb-8">
              To compare tools, add their slugs to the URL: <code className="px-2 py-1 bg-gray-100 rounded text-sm">/compare?tools=slug1,slug2,slug3</code>
            </p>
            <p className="text-[#5B657B] text-sm mb-8">
              Find tool slugs on their detail pages (shown in the URL). Example: <code className="px-2 py-1 bg-gray-100 rounded text-xs">/compare?tools=cursor,github-copilot,replit-agent</code>
            </p>
            <Link href="/tools" className="btn-primary inline-block">
              Browse tools
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const tools = await getToolsForComparison(toolSlugs);

  if (tools.length === 0) {
    notFound();
  }

  return (
    <div id="main-content" className="scroll-mt-16">
      <section className="section-spacing">
        <div className="container-max">
          <div className="mb-8">
            <nav aria-label="Breadcrumb" className="mb-4">
              <Link href="/tools" className="text-[#6C39EF] hover:underline focus-ring rounded">
                ← Back to tools
              </Link>
            </nav>
            <h1 className="heading-1 mb-6">
              Compare {tools.map((t: any) => t.name).join(' vs ')}
            </h1>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F9F8F5]">
                  <th className="text-left p-4 border border-[#E5E1DC] font-semibold text-[#171C26] min-w-[200px]">
                    Feature
                  </th>
                  {tools.map((tool: any) => (
                    <th key={tool.id} className="p-4 border border-[#E5E1DC] min-w-[250px]">
                      <Link 
                        href={`/tools/${tool.slug}`}
                        className="font-semibold text-[#171C26] hover:text-[#6C39EF] transition-colors focus-ring rounded"
                      >
                        {tool.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Description */}
                <tr>
                  <td className="p-4 border border-[#E5E1DC] font-medium text-[#171C26]">
                    Description
                  </td>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-[#E5E1DC] text-[#5B657B]">
                      {tool.tagline || tool.description}
                    </td>
                  ))}
                </tr>

                {/* Pricing */}
                <tr className="bg-[#FDFDFC]">
                  <td className="p-4 border border-[#E5E1DC] font-medium text-[#171C26]">
                    Pricing
                  </td>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-[#E5E1DC]">
                      <div className="font-semibold text-[#171C26] mb-1">
                        {tool.pricing_summary || 'Contact for pricing'}
                      </div>
                      {tool.has_free_tier === true && (
                        <span className="badge bg-green-50 text-green-700 border border-green-200 text-xs">
                          Free tier available
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Platforms */}
                <tr>
                  <td className="p-4 border border-[#E5E1DC] font-medium text-[#171C26]">
                    Platforms
                  </td>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-[#E5E1DC]">
                      {tool.platforms?.join(', ') || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Key Features */}
                <tr className="bg-[#FDFDFC]">
                  <td className="p-4 border border-[#E5E1DC] font-medium text-[#171C26] align-top">
                    Key Features
                  </td>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-[#E5E1DC]">
                      {tool.features && tool.features.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {tool.features.slice(0, 5).map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#6C39EF] mt-0.5">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[#5B657B]">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Last Verified - only show if we have real data */}
                {tools.some((t: any) => t.last_verified_at) && (
                  <tr className="bg-[#FDFDFC]">
                    <td className="p-4 border border-[#E5E1DC] font-medium text-[#171C26]">
                      Price Last Checked
                    </td>
                    {tools.map((tool: any) => (
                      <td key={tool.id} className="p-4 border border-[#E5E1DC] text-sm text-[#5B657B]">
                        {tool.last_verified_at 
                          ? new Date(tool.last_verified_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : '—'}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Action Row */}
                <tr>
                  <td className="p-4 border border-[#E5E1DC] font-medium text-[#171C26]">
                    
                  </td>
                  {tools.map((tool: any) => (
                    <td key={tool.id} className="p-4 border border-[#E5E1DC]">
                      <Link 
                        href={`/tools/${tool.slug}`}
                        className="btn-primary w-full text-center"
                      >
                        View details
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add More Tools */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#5B657B] mb-4">
              Want to compare different tools?
            </p>
            <Link href="/tools" className="btn-secondary inline-block">
              Browse all tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
