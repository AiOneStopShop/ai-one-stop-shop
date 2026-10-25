import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { supabase } from '@/lib/supabase';
import { generateBreadcrumbSchema, generateItemListSchema, safeJsonLd } from '@/lib/json-ld';
import { BANNED_SLUG_PATTERN, GUIDES, getGuide } from '@/lib/guides';

// Prices are read live from the catalog; refresh hourly.
export const revalidate = 3600;

type GuideTool = {
  slug: string;
  name: string;
  tagline: string | null;
  pricing_summary: string | null;
  has_free_tier: boolean | null;
  last_verified_at: string | null;
};

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Guide not found' };
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default async function GuidePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const slugs = guide.picks.map((pick) => pick.slug).filter((s) => !BANNED_SLUG_PATTERN.test(s));
  const { data } = await supabase
    .from('tools')
    .select('slug, name, tagline, pricing_summary, has_free_tier, last_verified_at')
    .eq('status', 'published')
    .in('slug', slugs);
  const bySlug = new Map<string, GuideTool>(((data as GuideTool[] | null) || []).map((tool) => [tool.slug, tool]));
  const picks = guide.picks
    .map((pick) => ({ pick, tool: bySlug.get(pick.slug) }))
    .filter((entry): entry is { pick: typeof entry.pick; tool: GuideTool } =>
      Boolean(entry.tool) && !BANNED_SLUG_PATTERN.test(entry.tool!.name)
    );

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: guide.title, url: `/guides/${guide.slug}` },
  ]);
  const list = generateItemListSchema(
    guide.title,
    guide.metaDescription,
    picks.map(({ pick, tool }) => ({ name: tool.name, url: `/tools/${tool.slug}`, description: pick.why }))
  );

  return (
    <div className="scroll-mt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(list) }} />
      <PageIntro
        title={guide.title}
        accent="books"
        lead={guide.question}
        above={
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li><Link href="/" className="text-soft hover:text-green focus-ring rounded underline underline-offset-2">Home</Link></li>
              <li aria-hidden="true" className="text-soft">/</li>
              <li><Link href="/guides" className="text-soft hover:text-green focus-ring rounded underline underline-offset-2">Guides</Link></li>
              <li aria-hidden="true" className="text-soft">/</li>
              <li aria-current="page" className="text-ink font-medium">{guide.audience}</li>
            </ol>
          </nav>
        }
      />
      <section className="py-10 md:py-14">
        <div className="container-max max-w-3xl">
          <div className="guide-prose">
            {guide.problem.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <h2 className="heading-2 mt-10 mb-6">Our picks</h2>
          {picks.length === 0 ? (
            <p className="text-soft">The catalog is unavailable right now. Please <Link href="/tools" className="text-green underline">browse all tools</Link>.</p>
          ) : (
            <ol className="space-y-6 list-none m-0 p-0">
              {picks.map(({ pick, tool }, index) => {
                const checked = formatDate(tool.last_verified_at);
                return (
                  <li key={tool.slug} className="rounded-2xl border border-line bg-white p-5 md:p-6">
                    <h3 className="heading-3 mb-1">
                      <span className="text-soft mr-2">{index + 1}.</span>
                      <Link href={`/tools/${tool.slug}`} className="text-green hover:underline focus-ring rounded">{tool.name}</Link>
                    </h3>
                    {tool.tagline && <p className="text-soft text-sm mb-3">{tool.tagline}</p>}
                    <p className="mb-3"><strong>Why it&apos;s here:</strong> {pick.why}</p>
                    <p className="text-sm">
                      <strong>Price:</strong> {tool.pricing_summary || 'See the pricing page'}
                      {tool.has_free_tier ? ' · Has a free plan' : ''}
                      {checked ? <span className="text-soft"> (last checked {checked})</span> : null}
                    </p>
                    <Link href={`/tools/${tool.slug}`} className="inline-flex items-center gap-1 mt-3 text-green font-medium hover:underline focus-ring rounded">
                      See {tool.name} details <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="guide-prose mt-10">
            <h2 className="heading-2">How we picked</h2>
            <p>
              Every pick is a published tool in our catalog. Prices come from each tool&apos;s own pricing page and can change, so check before you buy.
              No tool paid to be on this list. Read <Link href="/how-we-rank">how we rank</Link> and our <Link href="/disclosure">disclosure</Link>.
            </p>
            <h2 className="heading-2 mt-8">Keep going</h2>
            <ul>
              {guide.related.map((link) => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
              <li><Link href="/finder">Answer a few questions in the tool finder</Link></li>
              <li><Link href="/guides">See all guides</Link></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
