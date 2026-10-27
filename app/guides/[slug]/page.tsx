import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { getSiteUrl } from '@/lib/site-config';
import { supabase } from '@/lib/supabase';
import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateGuidePageSchema,
  generateItemListSchema,
  safeJsonLd,
} from '@/lib/json-ld';
import { BANNED_SLUG_PATTERN, GUIDES, getGuide } from '@/lib/guides';
import {
  formatGuideDate,
  guideAnswer,
  guideFaq,
  guideTaskRows,
  lastReviewedIso,
  priceCheckRange,
  priceCheckRangeLabel,
  PRICE_NOT_CHECKED,
  GUIDE_DISCLOSURE,
  GUIDE_DISCLOSURE_LINK,
  faqAnswerSchemaText,
  type GuideCatalogTool,
} from '@/lib/guide-content';

// Prices are read live from the catalog; refresh hourly.
export const revalidate = 3600;

type GuideTool = GuideCatalogTool;

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

const formatDate = formatGuideDate;

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
  const reviewedIso = lastReviewedIso(picks);
  const range = priceCheckRange(picks);
  const reviewedLabel = priceCheckRangeLabel(picks);
  const answer = guideAnswer(guide, picks);
  const taskRows = guideTaskRows(picks);
  const faq = guideFaq(guide, picks);
  const pageSchema = generateGuidePageSchema({
    slug: guide.slug,
    title: guide.title,
    description: guide.metaDescription,
    dateModified: reviewedIso,
  });

  return (
    <div className="scroll-mt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(list) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(pageSchema) }} />
      {faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(generateFaqSchema(faq.map((item) => ({ question: item.question, answer: faqAnswerSchemaText(item, getSiteUrl()) })))) }} />
      )}
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
          {answer && (
            <div className="note mb-8" data-testid="guide-answer">
              <p className="m-0">
                <strong>In short:</strong> {answer}
              </p>
              {reviewedLabel && (
                <p className="m-0 mt-2 text-sm text-soft" data-testid="guide-last-reviewed">
                  Prices last checked{' '}
                  {range && range.oldest !== range.newest ? (
                    <>
                      <time dateTime={range.oldest}>{formatGuideDate(range.oldest)}</time>{'\u2013'}<time dateTime={range.newest}>{formatGuideDate(range.newest)}</time>
                    </>
                  ) : (
                    <time dateTime={range?.newest}>{reviewedLabel}</time>
                  )}
                </p>
              )}
            </div>
          )}
          <div className="guide-prose">
            {guide.problem.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {guide.note && (
            <p className="note mt-6 text-sm" data-testid="guide-note">
              <strong>A note before you start:</strong> {guide.note}
            </p>
          )}

          {taskRows.length > 0 && (
            <>
              <h2 className="heading-2 mt-10 mb-4">Pick by task</h2>
              <div className="overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full text-sm text-left border-collapse" data-testid="guide-task-table">
                  <caption className="sr-only">{guide.title}: which tool to try for each task, with free plan and starting price</caption>
                  <thead className="bg-cream-2">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Task</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Tool</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Free plan</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Price from</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskRows.map((row) => (
                      <tr key={row.slug} className="border-t border-line align-top">
                        <td className="px-4 py-3">{row.task}</td>
                        <th scope="row" className="px-4 py-3 font-medium">
                          <Link href={`/tools/${row.slug}`} className="text-green underline underline-offset-2 focus-ring rounded">{row.name}</Link>
                        </th>
                        <td className="px-4 py-3">{row.freePlan}</td>
                        <td className="px-4 py-3">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-soft text-sm mt-2">Prices are the first plan listed in our catalog. Full pricing is in each pick below.</p>
            </>
          )}

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
                      {checked ? <span className="text-soft"> (last checked {checked})</span> : <span className="text-soft"> ({PRICE_NOT_CHECKED})</span>}
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
              <span data-testid="guide-disclosure">
                {GUIDE_DISCLOSURE} <Link href={GUIDE_DISCLOSURE_LINK.href}>{GUIDE_DISCLOSURE_LINK.label}</Link>
              </span>{' '}
              Prices come from each tool&apos;s own pricing page and can change, so check the tool&apos;s site before you buy. Read <Link href="/how-we-rank">how we rank</Link>.
            </p>
            {faq.length > 0 && (
              <section aria-labelledby="guide-faq" data-testid="guide-faq">
                <h2 id="guide-faq" className="heading-2 mt-8">Questions people ask</h2>
                {faq.map((item) => (
                  <div key={item.question}>
                    <h3>{item.question}</h3>
                    <p data-testid="guide-faq-answer">
                      {item.answer}
                      {item.link ? (
                        <>
                          {' '}
                          <Link href={item.link.href}>{item.link.label}</Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                ))}
              </section>
            )}
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
