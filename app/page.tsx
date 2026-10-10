import Link from 'next/link';
import { ArrowRight, Search, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Tool } from '@/types/database';
import { fallbackTools } from '@/lib/fallback-data';
import { generateOrganizationSchema, generateWebSiteSchema, safeJsonLd } from '@/lib/json-ld';

async function getToolsCount(): Promise<number> {
  const { count } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');
  
  return count || 0;
}

async function getFeaturedTools(): Promise<Tool[]> {
  // Get tools with editorial scores >= 85
  const { data: withScores } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'published')
    .gte('editorial_score', 85)
    .order('editorial_score', { ascending: false })
    .limit(20);
  
  // Filter out null scores
  const featured = withScores?.filter((t: Tool) => t.editorial_score !== null && t.editorial_score >= 85) || [];
  
  // If we don't have enough featured tools with real scores, fill with recent
  if (featured.length < 6) {
    const { data: recent } = await supabase
      .from('tools')
      .select('*')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(6);
    return recent || fallbackTools.slice(0, 6);
  }
  
  return featured.slice(0, 6);
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
    <div id="main-content" className="scroll-mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />

      {/* Hero Section */}
      <section className="section-spacing bg-gradient-to-b from-[#F9F8F5] to-white">
        <div className="container-max text-center">
          <h1 className="heading-hero mb-6">
            Find the Right AI Tool
          </h1>
          <p className="text-xl text-[#5B657B] max-w-2xl mx-auto mb-8">
            {toolsCount} AI tools, all checked by hand. No fake ratings, no paid rankings. Find tools that actually help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools" className="btn-primary">
              Browse all tools
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
            <Link href="/finder" className="btn-secondary">
              <Search className="mr-2 h-5 w-5" aria-hidden="true" />
              AI Tool Finder
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="section-spacing bg-white">
        <div className="container-max">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F3EFFF] text-[#6C39EF] mb-4">
                <CheckCircle className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="heading-3 mb-2">Hand-Checked</h2>
              <p className="text-[#5B657B]">
                We try each tool ourselves. No fake AI-generated ratings.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F3EFFF] text-[#6C39EF] mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h2 className="heading-3 mb-2">Real Pricing</h2>
              <p className="text-[#5B657B]">
                Pricing shown as found on vendor sites. Last updated Oct 2026.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F3EFFF] text-[#6C39EF] mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h2 className="heading-3 mb-2">Never Paid Rankings</h2>
              <p className="text-[#5B657B]">
                Tools don't pay to move up.{' '}
                <Link href="/how-we-rank" className="text-[#6C39EF] hover:underline focus-ring rounded">
                  See how
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="section-spacing bg-[#F9F8F5]">
        <div className="container-max">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-2">Featured Tools</h2>
            <Link href="/tools" className="text-[#6C39EF] hover:underline focus-ring rounded">
              View all →
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="card hover:shadow-lg transition-shadow group"
              >
                <h3 className="heading-3 mb-2 group-hover:text-[#6C39EF] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-[#5B657B] mb-4 line-clamp-3">
                  {tool.description || tool.tagline}
                </p>
                {tool.pricing_summary && (
                  <p className="text-sm text-[#6C39EF] font-medium">
                    {tool.pricing_summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-white">
        <div className="container-max max-w-3xl text-center">
          <h2 className="heading-2 mb-4">Can't find what you need?</h2>
          <p className="text-lead mb-8">
            Suggest a tool and we'll review it
          </p>
          <Link href="/submit" className="btn-primary">
            Submit a tool
          </Link>
        </div>
      </section>
    </div>
  );
}
