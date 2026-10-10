import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Tool, Category } from '@/types/database';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/json-ld';

async function getToolsCount(): Promise<number> {
  const { count } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');
  
  return count || 0;
}

async function getFeaturedTools(): Promise<Tool[]> {
  const { data } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'published')
    .gte('editorial_score', 85)
    .order('editorial_score', { ascending: false })
    .limit(6);
  
  return data || [];
}

export const metadata = {
  title: 'AI One Stop Shop - Honest AI Tools Directory',
  description: 'AI tools we\'ve actually tried and would suggest to a friend. No fake ratings, no paid rankings. Find the right tool for your work and budget.',
};

export default async function HomePage() {
  const toolsCount = await getToolsCount();
  const featuredTools = await getFeaturedTools();

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div id="main-content" className="scroll-mt-16">
        {/* Hero Section */}
        <section className="section-spacing bg-white">
          <div className="container-max">
            <div className="max-w-4xl">
              <h1 className="heading-display mb-6">
                Find the AI tool that fits your work, without the noise.
              </h1>
              <p className="text-lead mb-8 max-w-2xl">
                We try AI tools ourselves and tell you plainly what each one is good for, what it costs, and who it's built for. Right now that's {toolsCount} tools, and we'd rather add more carefully than pad the list. You stay in charge of the choice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/tools" 
                  className="btn-primary"
                >
                  See all {toolsCount} tools
                </Link>
                <Link 
                  href="/how-we-rank" 
                  className="btn-secondary"
                >
                  How we rank tools
                </Link>
              </div>
              <p className="text-sm text-[#5B657B] mt-4">
                Free to browse. No account needed.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Tools */}
        {featuredTools.length > 0 && (
          <section className="section-spacing">
            <div className="container-max">
              <h2 className="heading-2 mb-8">Tools we'd suggest to a friend</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="card group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="heading-3 group-hover:text-[#6C39EF] transition-colors">
                        {tool.name}
                      </h3>
                      {tool.has_free_tier && (
                        <span className="badge bg-green-50 text-green-700 border border-green-200 text-xs">
                          Free tier
                        </span>
                      )}
                    </div>
                    {tool.tagline && (
                      <p className="text-[#5B657B] mb-3">{tool.tagline}</p>
                    )}
                    {tool.pricing_summary && (
                      <p className="text-sm font-medium text-[#171C26]">
                        From {tool.pricing_summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href="/tools" className="btn-secondary">
                  View all tools
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Value Props */}
        <section className="section-spacing bg-[#4A2D86] text-white">
          <div className="container-max">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-6">How we make money</h2>
              <div className="space-y-4 text-lg">
                <p>
                  Some links are paid (affiliate) links. If you sign up through one, we may earn a commission at no extra cost to you.
                </p>
                <p>
                  Some tool makers pay for a clearly labeled <strong>Sponsored</strong> spot. Sponsored spots are kept separate from our ranked picks.
                </p>
                <p>
                  <strong>Money never changes our ranking.</strong> A tool doesn't move up because it pays us.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/disclosure" className="inline-block px-6 py-3 bg-white text-[#4A2D86] rounded-lg font-medium hover:bg-gray-100 transition-colors focus-ring">
                  Read our full disclosure
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-spacing">
          <div className="container-max">
            <div className="bg-[#F3EFFF] border border-[#6C39EF] rounded-2xl p-8 md:p-12 text-center">
              <h2 className="heading-2 mb-4">Start exploring</h2>
              <p className="text-lead mb-8 max-w-2xl mx-auto">
                Browse our hand-checked catalog of AI tools. Every tool includes what it does, who it's for, real pricing, and when we last verified it.
              </p>
              <Link href="/tools" className="btn-primary">
                Browse all {toolsCount} tools
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
